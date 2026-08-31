import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { q } from "../db";
import type { PaymentProvider } from "./provider";

/**
 * Square payments — official REST integration, server-side only. Credentials
 * come from env vars; nothing is ever exposed to the client. When credentials
 * are missing, payment creation throws a clear "not configured" error so the
 * checkout can fall back to a manual/pending flow rather than failing silently.
 */

function squareBase(): string {
  const env = process.env.SQUARE_ENVIRONMENT;
  return env === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
}

function accessToken(): string | null {
  return process.env.SQUARE_ACCESS_TOKEN ?? null;
}

export function squareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

export class SquareProvider implements PaymentProvider {
  id = "square";
  label = "Square";
  async createPayment(amountCents: number, currency: string, orderRef: string) {
    const token = accessToken();
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!token || !locationId) throw new Error("Square no está configurado");
    const idempotencyKey = `arem-${orderRef}`;
    const res = await fetch(`${squareBase()}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        quick_pay: { name: "AREM WORLD", price_money: { amount: amountCents, currency } },
        checkout_options: { redirect_url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://arem-mu.vercel.app" },
      }),
    });
    if (!res.ok) throw new Error(`Square error ${res.status}`);
    const data = (await res.json()) as { payment_link?: { id?: string; order_id?: string } };
    return {
      transactionId: data.payment_link?.id ?? idempotencyKey,
      status: "pending" as const,
      squareOrderId: data.payment_link?.order_id ?? null,
    };
  }
}

/** Verify a Square webhook signature (HMAC-SHA256 over the raw body). */
export function verifySquareWebhook(rawBody: string, signature: string | null): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key || !signature) return false;
  const expected = createHmac("sha256", key).update(rawBody).digest("base64");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  try {
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Idempotently record a webhook event; returns false if already processed. */
export async function recordWebhookEvent(eventId: string, provider: string, type: string, payload: unknown): Promise<boolean> {
  const res = await q<{ event_id: string }>(
    "insert into public.webhook_events (event_id, provider, type, payload) values ($1,$2,$3,$4) on conflict (event_id) do nothing returning event_id",
    [eventId, provider, type, JSON.stringify(payload)],
  );
  return res.length > 0;
}

/** Mark an order paid (idempotent by square payment id) and store payment. */
export async function markOrderPaid(orderId: string, squarePaymentId: string | null, squareOrderId: string | null, amountCents: number, currency: string): Promise<void> {
  await q(
    `update public.orders set payment_status = 'paid', status = 'processing', square_payment_id = $2, square_order_id = $3, paid_at = now(), updated_at = now()
     where id = $1 and payment_status <> 'paid'`,
    [orderId, squarePaymentId, squareOrderId],
  );
  await q(
    `insert into public.payments (order_id, provider, square_payment_id, square_order_id, amount_cents, currency, status, paid_at)
     values ($1,'square',$2,$3,$4,$5,'paid',now())
     on conflict do nothing`,
    [orderId, squarePaymentId, squareOrderId, amountCents, currency],
  );
}

export async function markOrderFailed(orderId: string, squarePaymentId: string | null): Promise<void> {
  await q("update public.orders set payment_status = 'failed', updated_at = now() where id = $1", [orderId]);
  if (squarePaymentId) {
    await q("insert into public.payments (order_id, provider, square_payment_id, amount_cents, currency, status) values ($1,'square',$2,0,'USD','failed') on conflict do nothing", [orderId, squarePaymentId]);
  }
}
