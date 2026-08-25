import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { mergeWishlist } from "@/lib/server/customer-db";

/** Merge guest (localStorage) product ids into the authenticated account wishlist. */
export async function POST(req: NextRequest) {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { productIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const productIds = Array.isArray(body.productIds) ? body.productIds.filter((x) => typeof x === "string") : [];
  const ids = await mergeWishlist(id, productIds);
  return NextResponse.json({ ok: true, ids });
}
