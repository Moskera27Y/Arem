import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { listCollections, listProductIdsForCollection, productCount, upsertCollection } from "@/lib/server/collections";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const rows = await listCollections();
  const withCounts = await Promise.all(
    rows.map(async (c) => ({ ...c, product_count: await productCount(c.id) })),
  );
  return NextResponse.json(withCounts);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : null);
  const nameEn = String(body.name_en || "").trim();
  const nameEs = String(body.name_es || nameEn).trim();
  const slug = String(body.slug || "").trim();
  if (!nameEn || !slug) {
    return NextResponse.json({ error: "Nombre y slug son requeridos" }, { status: 400 });
  }
  try {
    const row = await upsertCollection({
      id: typeof body.id === "string" ? body.id : undefined,
      name_en: nameEn,
      name_es: nameEs,
      slug,
      description_en: str("description_en"),
      description_es: str("description_es"),
      tagline_en: str("tagline_en"),
      tagline_es: str("tagline_es"),
      story_en: str("story_en"),
      story_es: str("story_es"),
      image_key: str("image_key"),
      image_url: str("image_url"),
      image_alt_en: str("image_alt_en"),
      image_alt_es: str("image_alt_es"),
      is_active: typeof body.is_active === "boolean" ? body.is_active : true,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    });
    const productIds = Array.isArray(body.product_ids) ? body.product_ids.filter((x): x is string => typeof x === "string") : null;
    if (productIds) {
      const { setProductIds } = await import("@/lib/server/collections");
      await setProductIds(row.id, productIds);
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error("upsert collection error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
