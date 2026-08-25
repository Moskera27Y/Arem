import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerEmail, getCustomerProfileId } from "@/lib/server/customer-auth";
import { getOrder, type Order, type Shipment, type TrackingEvent } from "@/lib/server/customer-db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

const STATUS_KEY: Record<string, keyof import("@/lib/i18n/dictionaries").Dictionary["account"]> = {
  pending_payment: "statusPendingPayment",
  paid: "statusPaid",
  processing: "statusProcessing",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
  refunded: "statusRefunded",
};
const PAY_KEY: Record<string, keyof import("@/lib/i18n/dictionaries").Dictionary["account"]> = {
  pending: "paymentPending",
  paid: "paymentPaid",
  refunded: "paymentRefunded",
  failed: "paymentFailed",
};

const money = (v: string | number, currency: string) => {
  const n = Number(v);
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale } = await params;
  return { title: locale === "es" ? "Detalle del pedido" : "Order details" };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id: orderId } = (await params) as { locale: Locale; id: string };
  const email = await getCustomerEmail();
  if (!email) redirect(`/${locale}/signin`);
  const profileId = await getCustomerProfileId(email);
  if (!profileId) redirect(`/${locale}/signin`);
  const data = await getOrder(profileId, orderId);
  const dict = getDictionary(locale);
  const a = dict.account;
  const prefix = `/${locale}`;

  if (!data) {
    return (
      <div className="account__card">
        <p className="acc-empty">{a.noOrders}</p>
      </div>
    );
  }
  const { order, items, shipments, tracking } = data;
  const date = new Date(order.created_at).toLocaleDateString(locale === "es" ? "es-CO" : "en-US");
  const ship = order.shipping_address as Record<string, unknown> | null;
  const timeline = tracking.length > 0 ? tracking : [];

  return (
    <div className="account__card">
      <div className="account__heading">
        <h1>{a.orderNumber} {order.order_number}</h1>
        <p>{a.orderDate}: {date}</p>
        <p style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span className="acc-pill">{a[STATUS_KEY[order.status] ?? "statusPendingPayment"]}</span>
          <span className="acc-pill">{a[PAY_KEY[order.payment_status] ?? "paymentPending"]}</span>
        </p>
      </div>

      <h3 style={{ fontSize: "var(--text-md, 18px)", margin: "0 0 0.75rem" }}>{a.items}</h3>
      <table className="acc-table">
        <thead>
          <tr>
            <th>{a.items}</th>
            <th>{a.quantity}</th>
            <th>{a.price}</th>
            <th>{a.total}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.product_name}</td>
              <td>{it.quantity}</td>
              <td>{money(it.unit_price, order.currency)}</td>
              <td>{money(it.line_total, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem", gap: "1.5rem" }}>
        <div>
          <div className="meta">{dict.cart.subtotal}: {money(order.subtotal, order.currency)}</div>
          <div className="meta">{dict.cart.shipping}: {money(order.shipping_total, order.currency)}</div>
          <div className="meta" style={{ fontWeight: 600 }}>{a.total}: {money(order.total, order.currency)}</div>
          <div className="meta" style={{ fontSize: "var(--text-2xs, 12px)" }}>
            {locale === "es" ? "El pago final se cobra en USD." : "Final payment is charged in USD."}
          </div>
        </div>
      </div>

      {ship && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 style={{ fontSize: "var(--text-md, 18px)", margin: "0 0 0.5rem" }}>{a.shippingAddress}</h3>
          <p className="acc-note" style={{ margin: 0 }}>
            {String(ship.recipient_name ?? "")}
            <br />
            {String(ship.line1 ?? "")}
            {ship.line2 ? <>, {String(ship.line2)}</> : null}
            <br />
            {[String(ship.city ?? ""), String(ship.state ?? ""), String(ship.postal_code ?? "")].filter(Boolean).join(", ")} · {String(ship.country ?? "")}
          </p>
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <h3 style={{ fontSize: "var(--text-md, 18px)", margin: "0 0 0.5rem" }}>{a.trackingNumber}</h3>
        {shipments[0]?.tracking_number ? (
          <p className="acc-note" style={{ margin: 0 }}>{shipments[0].tracking_number}</p>
        ) : (
          <p className="acc-note" style={{ margin: 0 }}>{a.trackingPending}</p>
        )}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h3 style={{ fontSize: "var(--text-md, 18px)", margin: "0 0 0.5rem" }}>{a.shipmentTimeline}</h3>
        {timeline.length === 0 ? (
          <p className="acc-note" style={{ margin: 0 }}>{a.trackingPending}</p>
        ) : (
          <ul className="acc-timeline">
            {timeline.map((ev, idx) => (
              <li key={ev.id} className={idx === timeline.length - 1 ? "done" : ""}>
                <div className="t-status">{ev.status}</div>
                {ev.description && <div className="t-desc">{ev.description}</div>}
                <div className="t-desc">{new Date(ev.occurred_at).toLocaleString(locale === "es" ? "es-CO" : "en-US")}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <Link href={`${prefix}/account/orders`} className="footer__link">
          ← {a.backToOrders}
        </Link>
      </div>
    </div>
  );
}
