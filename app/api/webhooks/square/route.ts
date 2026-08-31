import { NextRequest, NextResponse } from "next/server";
import { q } from "@/lib/server/db";
import { markOrderFailed, markOrderPaid, recordWebhookEvent, verifySquareWebhook } from "@/lib/server/payments/square";

export const dynamic = "force-dynamic";

/**
 * Square webhook. Verifies the HMAC signature, processes each event exactly
 * once (idempotency via webhook_events), and never fabricates order state.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");
  if (!verifySquareWebhook(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const eventId = String(body.event_id ?? body.merchant_id ?? Date.now());
  const type = String(body.type ?? "");
  const fresh = await recordWebhookEvent(eventId, "square", type, body);
  if (!fresh) return NextResponse.json({ ok: true, duplicate: true });

  try {
    if (type === "payment.updated") {
      const data = body.data as Record<string, unknown> | undefined;
      const payment = data?.object as Record<string, unknown> | undefined;
      const status = String(payment?.status ?? "");
      const amountMoney = payment?.amount_money as Record<string, unknown> | undefined;
      const amountCents = Number(amountMoney?.amount ?? 0);
      const currency = String(amountMoney?.currency ?? "USD");
      const squarePaymentId = String(payment?.id ?? "");
      const squareOrderId = String(payment?.order_id ?? "");
      // Find our order via the stored Square payment/order id or transaction id.
      const rows = await q<{ id: string }>(
        "select id from public.orders where square_payment_id = $1 or square_order_id = $2 or transaction_id = $3 limit 1",
        [squarePaymentId, squareOrderId, squarePaymentId],
      );
      if (rows[0]) {
        if (status === "COMPLETED") await markOrderPaid(rows[0].id, squarePaymentId, squareOrderId, amountCents, currency);
        else if (status === "FAILED" || status === "CANCELED") await markOrderFailed(rows[0].id, squarePaymentId);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("square webhook error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
