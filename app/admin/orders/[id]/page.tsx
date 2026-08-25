import Link from "next/link";
import { notFound } from "next/navigation";
import { q } from "@/lib/server/db";
import { OrderStatusEditor } from "@/components/admin/OrderStatusEditor";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal: string;
  shipping_total: string;
  tax_total: string;
  total: string;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  created_at: string;
}
interface ItemRow {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}
interface ShipRow {
  id: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
}
interface EvRow {
  id: string;
  status: string;
  description: string | null;
  occurred_at: string;
  shipment_id: string;
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await q<OrderRow>("select * from public.orders where id = $1", [id]);
  if (!rows[0]) notFound();
  const order = rows[0];
  const items = await q<ItemRow>("select * from public.order_items where order_id = $1 order by created_at", [id]);
  const shipments = await q<ShipRow>("select * from public.shipments where order_id = $1 order by created_at", [id]);
  const events: EvRow[] = [];
  for (const s of shipments) {
    const ev = await q<EvRow>("select * from public.tracking_events where shipment_id = $1 order by occurred_at", [s.id]);
    events.push(...ev.map((e) => ({ ...e, shipment_id: s.id })));
  }
  const ship = order.shipping_address as Record<string, unknown> | null;

  return (
    <div>
      <header style={{ marginBottom: "1rem" }}>
        <Link href="/admin/orders" className="footer__link">
          ← Orders
        </Link>
        <h1 style={{ fontSize: 22, marginTop: "0.5rem" }}>Order {order.order_number}</h1>
        <p className="muted">{new Date(order.created_at).toLocaleString()}</p>
      </header>

      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Line</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.product_name}</td>
                <td>{it.quantity}</td>
                <td>{Number(it.unit_price).toFixed(2)} {order.currency}</td>
                <td>{Number(it.line_total).toFixed(2)} {order.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          Subtotal {Number(order.subtotal).toFixed(2)} · Shipping {Number(order.shipping_total).toFixed(2)} · Tax{" "}
          {Number(order.tax_total).toFixed(2)} · Total {Number(order.total).toFixed(2)} {order.currency}
        </p>
      </div>

      {ship && (
        <div className="admin-card" style={{ marginTop: "1rem" }}>
          <h3 style={{ margin: "0 0 0.5rem" }}>Shipping address</h3>
          <p className="muted" style={{ margin: 0 }}>
            {String(ship.recipient_name ?? "")}
            <br />
            {String(ship.line1 ?? "")}
            {ship.line2 ? <>, {String(ship.line2)}</> : null}
            <br />
            {[String(ship.city ?? ""), String(ship.state ?? ""), String(ship.postal_code ?? "")].filter(Boolean).join(", ")} · {String(ship.country ?? "")}
          </p>
        </div>
      )}

      <div className="admin-card" style={{ marginTop: "1rem" }}>
        <h3 style={{ margin: "0 0 0.5rem" }}>Shipment &amp; tracking</h3>
        {shipments.length === 0 ? (
          <p className="muted">No shipment created yet. Tracking will appear once the order ships.</p>
        ) : (
          shipments.map((s) => (
            <div key={s.id}>
              <p className="muted" style={{ margin: 0 }}>
                {s.status} {s.carrier ? `· ${s.carrier}` : ""} {s.tracking_number ? `· ${s.tracking_number}` : "· tracking pending"}
              </p>
              <ul className="acc-timeline" style={{ marginTop: "0.5rem" }}>
                {events
                  .filter((e) => e.shipment_id === s.id)
                  .map((e) => (
                    <li key={e.id} className="done">
                      <div className="t-status">{e.status}</div>
                      {e.description && <div className="t-desc">{e.description}</div>}
                    </li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <OrderStatusEditor orderId={order.id} initialStatus={order.status} initialPayment={order.payment_status} />
    </div>
  );
}
