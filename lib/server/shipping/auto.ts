import "server-only";
import { q } from "../db";
import { getShippingProvider } from "./provider";

/** Create the shipping guide automatically once an order is paid.
 * Idempotent: skips when a shipment already exists. Never throws. */
export async function autoCreateShipment(orderId: string): Promise<{ skipped: boolean; trackingNumber?: string }> {
  const existing = await q<{ id: string; tracking_number: string | null }>(
    "select id, tracking_number from public.shipments where order_id = $1 limit 1",
    [orderId],
  );
  if (existing.length > 0) return { skipped: true, trackingNumber: existing[0].tracking_number ?? undefined };

  const orders = await q<{ id: string; shipping_address: unknown; shipping_method: string | null; payment_status: string }>(
    "select id, shipping_address, shipping_method, payment_status from public.orders where id = $1",
    [orderId],
  );
  if (orders.length === 0) return { skipped: true };
  // Never buy a real carrier label for an unpaid order.
  if (orders[0].payment_status !== "paid") return { skipped: true };

  try {
    const provider = getShippingProvider();
    const destination = {
      ...((orders[0].shipping_address ?? {}) as Record<string, unknown>),
      shippingMethod: orders[0].shipping_method ?? "standard",
      weightKg: 1,
    };
    const shipment = await provider.createShipment(orderId, destination);
    const rows = await q<{ id: string }>(
      `insert into public.shipments (order_id, status, carrier, tracking_number, estimated_delivery)
       values ($1,'LABEL_CREATED',$2,$3, now() + interval '5 days') returning id`,
      [orderId, shipment.trackingNumber ? shipment.carrier : provider.id, shipment.trackingNumber],
    );
    const shipmentId = rows[0]?.id;
    if (shipmentId) {
      await q(
        `insert into public.tracking_events (shipment_id, status, description) values ($1,'LABEL_CREATED',$2)`,
        [shipmentId, `Guía ${shipment.trackingNumber} generada automáticamente`],
      );
    }
    return { skipped: false, trackingNumber: shipment.trackingNumber };
  } catch (err) {
    console.error("autoCreateShipment error", err);
    return { skipped: true };
  }
}
