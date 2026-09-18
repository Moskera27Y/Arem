import { NextRequest, NextResponse } from "next/server";
import { createCheckoutOrder, type CheckoutInput } from "@/lib/server/checkout";
import { checkRateLimit, getClientKey } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** Guest checkout: creates a real order (inventory validated + decremented
 * server-side). No auth required — guests may buy without an account. */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getClientKey(req, "checkout"), 20, 60 * 1000);
  if (!rl.ok) {
    const res = NextResponse.json({ error: "Demasiadas solicitudes, intenta más tarde" }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfter));
    return res;
  }
  let body: CheckoutInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  try {
    const result = await createCheckoutOrder(body);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error de servidor";
    const status = /inválido|insuficiente|contacto|Carrito|pago|envío/i.test(msg) ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
