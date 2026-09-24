import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { allowedActions, transitionOrder, type OrderAction } from "@/lib/server/orders";

type Ctx = { params: Promise<{ id: string }> };

const ACTIONS: OrderAction[] = ["approve_payment", "ship", "deliver", "cancel", "delete"];

/**
 * Admin order workflow: guarded state transitions with side effects
 * (restock, shipment, customer notification). Replaces free-form edits.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  if (!body.action || !(ACTIONS as string[]).includes(body.action)) {
    return NextResponse.json({ error: "acción no válida" }, { status: 400 });
  }
  try {
    const result = await transitionOrder(id, body.action as OrderAction);
    return NextResponse.json({ ok: true, ...result, allowed: allowedActions(result.status) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error de servidor";
    const status = /not allowed|not found/i.test(msg) ? 400 : 500;
    if (status === 500) console.error("order action error", msg);
    return NextResponse.json({ error: status === 500 ? "Error de servidor" : msg }, { status });
  }
}
