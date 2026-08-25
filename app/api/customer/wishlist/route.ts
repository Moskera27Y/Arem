import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { addWishlist, clearWishlist, getWishlistIds, removeWishlist } from "@/lib/server/customer-db";

export async function GET() {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const ids = await getWishlistIds(id);
  return NextResponse.json({ ids });
}

export async function POST(req: NextRequest) {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const productId = String(body.productId || "");
  if (!productId) return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  await addWishlist(id, productId);
  return NextResponse.json({ ok: true, ids: await getWishlistIds(id) });
}

export async function DELETE(req: NextRequest) {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const url = new URL(req.url);
  if (url.searchParams.get("clear") === "1") {
    await clearWishlist(id);
    return NextResponse.json({ ok: true, ids: [] });
  }
  const productId = url.searchParams.get("productId") ?? "";
  if (!productId) return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  await removeWishlist(id, productId);
  return NextResponse.json({ ok: true, ids: await getWishlistIds(id) });
}
