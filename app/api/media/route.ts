import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { deleteMedia, listMedia, seedMediaDefaults, upsertMedia, type MediaType } from "@/lib/server/media";
import { requireAdmin } from "@/lib/server/auth";

/** Public storefront media list (used by ManagedImage to resolve images). */
export async function GET() {
  try {
    let rows = await listMedia();
    // First visit: seed Neon with the storefront's default assets.
    if (rows.length === 0) {
      await seedMediaDefaults();
      rows = await listMedia();
    }
    return NextResponse.json(rows);
  } catch (err) {
    console.error("list media error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}

/** Admin: create or replace a media record (upsert by key). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (typeof body?.key !== "string" || !body.key) return NextResponse.json({ error: "key requerido" }, { status: 400 });
  if (typeof body?.url !== "string" || !body.url) return NextResponse.json({ error: "url requerida" }, { status: 400 });

  const allowed: MediaType[] = ["hero", "product", "category", "story", "region", "social", "footer", "logo"];
  const type = allowed.includes(body.type) ? body.type : "product";

  try {
    const row = await upsertMedia({
      key: body.key,
      url: body.url,
      storage_path: body.storage_path ?? null,
      type,
      usage: body.usage ?? null,
      alt_en: body.alt_en ?? null,
      alt_es: body.alt_es ?? null,
      entity_type: body.entity_type ?? null,
      entity_id: body.entity_id ?? null,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    });
    return NextResponse.json(row);
  } catch (err) {
    console.error("upsert media error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}

/** Admin: delete a media record (and, when it points to Blob, the file). */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  try {
    const rows = await (
      await import("@/lib/server/db")
    ).q<{ storage_path: string | null }>("select storage_path from public.media where id = $1", [id]);
    const storagePath = rows[0]?.storage_path;
    await deleteMedia(id);
    if (storagePath && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(storagePath, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch {
        /* file may already be gone */
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete media error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
