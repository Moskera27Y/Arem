import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { listProductIdsForCollection, setProductIds } from "@/lib/server/collections";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const ids = await listProductIdsForCollection(id);
  return NextResponse.json({ product_ids: ids });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  let body: { product_ids?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const ids = Array.isArray(body.product_ids) ? body.product_ids.filter((x): x is string => typeof x === "string") : [];
  try {
    await setProductIds(id, ids);
    return NextResponse.json({ ok: true, product_ids: ids });
  } catch (err) {
    console.error("set collection products error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
