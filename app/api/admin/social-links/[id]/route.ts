import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { deleteSocialLink } from "@/lib/server/social";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await deleteSocialLink(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete social link error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
