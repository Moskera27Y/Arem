import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getProductCollectionIds, setProductCollections } from "@/lib/server/collections";

type Ctx = { params: Promise<{ productId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { productId } = await params;
  const ids = await getProductCollectionIds(productId);
  return NextResponse.json({ collection_ids: ids });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { productId } = await params;
  let body: { collection_ids?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const ids = Array.isArray(body.collection_ids) ? body.collection_ids.filter((x): x is string => typeof x === "string") : [];
  try {
    await setProductCollections(productId, ids);
    return NextResponse.json({ ok: true, collection_ids: ids });
  } catch (err) {
    console.error("set product collections error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
