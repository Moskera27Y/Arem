import { NextRequest, NextResponse } from "next/server";
import { createCheckoutOrder, type CheckoutInput } from "@/lib/server/checkout";

export const dynamic = "force-dynamic";

/** Guest checkout: creates a real order (inventory validated + decremented
 * server-side). No auth required — guests may buy without an account. */
export async function POST(req: NextRequest) {
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
    const status = /inválido|Stock insuficiente|requeridos/.test(msg) ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
