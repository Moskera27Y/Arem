import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/server/auth";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Admin: upload a file to Vercel Blob, returning the public URL + path. */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El archivo supera 10 MB" }, { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error("BLOB_READ_WRITE_TOKEN not set");
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const blob = await put(`arem-media/${Date.now()}-${file.name.replace(/[^a-z0-9.\-]/gi, "_")}`, Buffer.from(await file.arrayBuffer()), {
      access: "public",
      token,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
