import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { autoCreateShipment } from "@/lib/server/shipping/auto";

type Ctx = { params: Promise<{ id: string }> };

/** Admin: generate the shipping guide for a paid order (idempotent).
 * Refuses unpaid orders so no real carrier label is bought by mistake. */
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  if (!/^[0-9a-f-]{8,64}$/i.test(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });
  const out = await autoCreateShipment(id);
  if (out.skipped && !out.trackingNumber) {
    return NextResponse.json({ error: "La orden no está pagada o ya tiene guía" }, { status: 409 });
  }
  return NextResponse.json({ ok: true, ...out });
}
