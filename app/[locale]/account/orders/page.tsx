import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerEmail, getCustomerProfileId } from "@/lib/server/customer-auth";
import { listOrders } from "@/lib/server/customer-db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

const STATUS_KEY: Record<string, keyof DictionaryAccount> = {
  pending_payment: "statusPendingPayment",
  paid: "statusPaid",
  processing: "statusProcessing",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
  refunded: "statusRefunded",
};
type DictionaryAccount = import("@/lib/i18n/dictionaries").Dictionary["account"];

const money = (v: string | number, currency: string) => {
  const n = Number(v);
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
};

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  const email = await getCustomerEmail();
  if (!email) redirect(`/${locale}/signin`);
  const id = await getCustomerProfileId(email);
  if (!id) redirect(`/${locale}/signin`);
  const orders = await listOrders(id);
  const dict = getDictionary(locale);
  const a = dict.account;
  const prefix = `/${locale}`;

  return (
    <div className="account__card">
      <div className="account__heading">
        <h1>{a.ordersTitle}</h1>
        <p>{a.ordersSub}</p>
      </div>
      {orders.length === 0 ? (
        <p className="acc-empty">{a.noOrders}</p>
      ) : (
        <table className="acc-table">
          <thead>
            <tr>
              <th>{a.orderNumber}</th>
              <th>{a.orderDate}</th>
              <th>{a.total}</th>
              <th>{a.paymentStatus}</th>
              <th>{a.fulfillmentStatus}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`${prefix}/account/orders/${o.id}`} style={{ color: "#1e4036", fontWeight: 600 }}>
                    {o.order_number}
                  </Link>
                </td>
                <td>{new Date(o.created_at).toLocaleDateString(locale === "es" ? "es-CO" : "en-US")}</td>
                <td>{money(o.total, o.currency)}</td>
                <td>
                  <span className="acc-pill">{a[o.payment_status === "paid" ? "paymentPaid" : o.payment_status === "refunded" ? "paymentRefunded" : o.payment_status === "failed" ? "paymentFailed" : "paymentPending"]}</span>
                </td>
                <td>
                  <span className={`acc-pill ${o.status === "cancelled" || o.status === "refunded" ? "acc-pill--danger" : "acc-pill--warn"}`}>
                    {a[STATUS_KEY[o.status] ?? "statusPendingPayment"]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
