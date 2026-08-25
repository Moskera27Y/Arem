import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { q } from "@/lib/server/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const orders = await q<Record<string, unknown>>(
    "select * from public.orders where id = $1", [id],
  );
  if (!orders[0]) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const items = await q<Record<string, unknown>>("select * from public.order_items where order_id = $1 order by created_at", [id]);
  const shipments = await q<Record<string, unknown>>("select * from public.shipments where order_id = $1 order by created_at", [id]);
  const tracking = [];
  for (const s of shipments) {
    const ev = await q<Record<string, unknown>>("select * from public.tracking_events where shipment_id = $1 order by occurred_at", [(s as { id: string }).id]);
    tracking.push({ shipment_id: s.id, events: ev });
  }
  return NextResponse.json({ order: orders[0], items, shipments, tracking });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  let body: { status?: string; payment_status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  if (body.status) {
    await q("update public.orders set status = $1, updated_at = now() where id = $2", [body.status, id]);
  }
  if (body.payment_status) {
    await q("update public.orders set payment_status = $1, updated_at = now() where id = $2", [body.payment_status, id]);
  }
  return NextResponse.json({ ok: true });
}
