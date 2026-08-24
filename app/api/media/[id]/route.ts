import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { deleteMedia } from "@/lib/server/media";
import { requireAdmin } from "@/lib/server/auth";

/** Admin: delete a media record (and, when it points to Blob, the file). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;

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
