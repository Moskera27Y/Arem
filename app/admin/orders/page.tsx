import Link from "next/link";
import { q } from "@/lib/server/db";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: string;
  currency: string;
  created_at: string;
  customer_email: string;
  item_count: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function AdminOrdersPage() {
  const orders = await q<Row>(
    `select o.id, o.order_number, o.status, o.payment_status, o.total, o.currency, o.created_at,
            cp.email as customer_email,
            (select coalesce(sum(oi.quantity),0) from public.order_items oi where oi.order_id = o.id) as item_count
       from public.orders o
       join public.customer_profiles cp on cp.id = o.customer_profile_id
       order by o.created_at desc`,
  );

  return (
    <div>
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: 22 }}>Orders</h1>
        <p className="muted">Order management (payments ship with Square in a later phase).</p>
      </header>
      {orders.length === 0 ? (
        <div className="admin-card">
          <p className="muted">No orders yet. Orders appear here once checkout is enabled.</p>
        </div>
      ) : (
        <div className="admin-card" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/orders/${o.id}`} style={{ fontWeight: 600 }}>
                      {o.order_number}
                    </Link>
                  </td>
                  <td>{o.customer_email}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>{o.item_count}</td>
                  <td>
                    {Number(o.total).toFixed(2)} {o.currency}
                  </td>
                  <td>{o.payment_status}</td>
                  <td>
                    <span className="chip chip--published">{STATUS_LABEL[o.status] ?? o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
