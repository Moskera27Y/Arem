import "server-only";
import { q, withTransaction } from "./db";
import { sendEmail } from "./email";
import { autoCreateShipment } from "./shipping/auto";

/**
 * Order lifecycle state machine.
 *
 * - pending_payment: order created, payment not yet confirmed.
 * - paid/processing: payment approved — AUTOMATIC via Square webhook, or
 *   MANUAL via admin approval (manual methods: card-manual, PayPal, Wompi).
 * - shipped: MANUAL by admin (notification carries tracking when available).
 * - delivered (completed): by the CUSTOMER confirming receipt (account
 *   orders) or manually by admin (guest orders).
 * - cancelled: manual by admin (restocks inventory).
 * - delete: manual by admin, only for cancelled/failed/pending_payment
 *   (restocks unless already restocked by cancel).
 */

export type OrderAction =
  | "approve_payment"
  | "ship"
  | "deliver"
  | "cancel"
  | "delete";

export function allowedActions(status: string): OrderAction[] {
  switch (status) {
    case "pending_payment":
    case "failed":
      return ["approve_payment", "cancel", "delete"];
    case "processing":
      return ["ship", "cancel"];
    case "shipped":
      return ["deliver"];
    case "cancelled":
      return ["delete"];
    default:
      return [];
  }
}

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  email: string | null;
  customer_profile_id: string | null;
}

async function getOrderRow(orderId: string): Promise<OrderRow | null> {
  const rows = await q<OrderRow>(
    "select id, order_number, status, payment_status, email, customer_profile_id from public.orders where id = $1",
    [orderId],
  );
  return rows[0] ?? null;
}

async function orderLocale(order: OrderRow): Promise<"es" | "en"> {
  if (order.customer_profile_id) {
    const r = await q<{ preferred_language: string }>(
      "select preferred_language from public.customer_profiles where id = $1",
      [order.customer_profile_id],
    );
    const l = r[0]?.preferred_language;
    if (l === "en" || l === "es") return l;
  }
  return "es";
}

async function restock(orderId: string): Promise<void> {
  const items = await q<{ variant_id: string; quantity: number }>(
    "select variant_id, quantity from public.order_items where order_id = $1",
    [orderId],
  );
  for (const it of items) {
    await q("update public.product_inventory set stock = stock + $2, updated_at = now() where variant_id = $1", [
      it.variant_id,
      it.quantity,
    ]);
  }
}

type NoticeKind = "paid" | "shipped" | "delivered" | "cancelled";

function noticeText(kind: NoticeKind, orderNumber: string, tracking: string | null) {
  const trackLine = (es: boolean) =>
    tracking
      ? es
        ? `Guía: ${tracking}. Rastrea tu pedido en la sección de rastreo.`
        : `Tracking: ${tracking}. Track your order in the tracking section.`
      : "";
  const T: Record<NoticeKind, { es: { s: string; b: string }; en: { s: string; b: string } }> = {
    paid: {
      es: {
        s: `Pago aprobado · Pedido ${orderNumber}`,
        b: `Tu pago fue aprobado y tu pedido ${orderNumber} entró en preparación. Te avisaremos cuando se envíe.`,
      },
      en: {
        s: `Payment approved · Order ${orderNumber}`,
        b: `Your payment was approved and order ${orderNumber} is now being prepared. We'll notify you on shipment.`,
      },
    },
    shipped: {
      es: {
        s: `Tu pedido ${orderNumber} va en camino`,
        b: `Tu pedido ${orderNumber} fue enviado. ${trackLine(true)}`,
      },
      en: {
        s: `Your order ${orderNumber} is on its way`,
        b: `Your order ${orderNumber} shipped. ${trackLine(false)}`,
      },
    },
    delivered: {
      es: {
        s: `Pedido ${orderNumber} completado`,
        b: `El pedido ${orderNumber} fue marcado como entregado. ¡Gracias por comprar artesanía colombiana!`,
      },
      en: {
        s: `Order ${orderNumber} completed`,
        b: `Order ${orderNumber} was marked as delivered. Thanks for supporting Colombian craft!`,
      },
    },
    cancelled: {
      es: {
        s: `Pedido ${orderNumber} cancelado`,
        b: `El pedido ${orderNumber} fue cancelado. Si ya habías pagado, te contactaremos para el reembolso.`,
      },
      en: {
        s: `Order ${orderNumber} cancelled`,
        b: `Order ${orderNumber} was cancelled. If you already paid, we'll contact you about the refund.`,
      },
    },
  };
  return T[kind];
}

/** Best-effort customer notification (Resend when configured). Never throws. */
export async function notifyCustomer(orderId: string, kind: NoticeKind): Promise<void> {
  try {
    const order = await getOrderRow(orderId);
    if (!order?.email) return;
    const locale = await orderLocale(order);
    let tracking: string | null = null;
    if (kind === "shipped") {
      const s = await q<{ tracking_number: string | null }>(
        "select tracking_number from public.shipments where order_id = $1 order by created_at desc limit 1",
        [orderId],
      );
      tracking = s[0]?.tracking_number ?? null;
    }
    const t = noticeText(kind, order.order_number, tracking)[locale];
    await sendEmail({ to: order.email, subject: t.s, html: `<p>${t.b}</p>`, text: t.b });
  } catch (err) {
    console.error("notify customer error", err instanceof Error ? err.message : "unknown");
  }
}

export async function transitionOrder(
  orderId: string,
  action: OrderAction,
): Promise<{ status: string; payment_status: string }> {
  const order = await getOrderRow(orderId);
  if (!order) throw new Error("Order not found");
  if (!allowedActions(order.status).includes(action)) {
    throw new Error(`Action ${action} not allowed from ${order.status}`);
  }

  switch (action) {
    case "approve_payment": {
      await q(
        "update public.orders set payment_status = 'paid', status = 'processing', paid_at = now(), updated_at = now() where id = $1",
        [orderId],
      );
      await q(
        `insert into public.payments (order_id, provider, amount_cents, currency, status, paid_at)
         values ($1,'manual',0,'USD','paid',now()) on conflict do nothing`,
        [orderId],
      ).catch(() => {});
      await autoCreateShipment(orderId).catch((e) => console.error("auto shipment error", e));
      await notifyCustomer(orderId, "paid");
      return { status: "processing", payment_status: "paid" };
    }
    case "ship": {
      await q("update public.orders set status = 'shipped', updated_at = now() where id = $1", [orderId]);
      await notifyCustomer(orderId, "shipped");
      return { status: "shipped", payment_status: order.payment_status };
    }
    case "deliver": {
      await q("update public.orders set status = 'delivered', updated_at = now() where id = $1", [orderId]);
      await notifyCustomer(orderId, "delivered");
      return { status: "delivered", payment_status: order.payment_status };
    }
    case "cancel": {
      await q("update public.orders set status = 'cancelled', updated_at = now() where id = $1", [orderId]);
      await restock(orderId);
      await notifyCustomer(orderId, "cancelled");
      return { status: "cancelled", payment_status: order.payment_status };
    }
    case "delete": {
      // Restock unless cancel already did (cancelled restocks at cancel time).
      if (order.status !== "cancelled") await restock(orderId);
      await withTransaction(async (client) => {
        const ships = await client.query<{ id: string }>("select id from public.shipments where order_id = $1", [
          orderId,
        ]);
        for (const s of ships.rows) {
          await client.query("delete from public.tracking_events where shipment_id = $1", [s.id]);
        }
        await client.query("delete from public.shipments where order_id = $1", [orderId]);
        await client.query("delete from public.order_items where order_id = $1", [orderId]);
        await client.query("delete from public.payments where order_id = $1", [orderId]);
        await client.query("delete from public.orders where id = $1", [orderId]);
      });
      return { status: "deleted", payment_status: order.payment_status };
    }
  }
}
