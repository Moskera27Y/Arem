import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { listSocialLinks, upsertSocialLink } from "@/lib/server/social";
import type { SocialNetwork } from "@/lib/admin/types";

const NETWORKS: SocialNetwork[] = ["instagram", "tiktok", "pinterest", "facebook", "whatsapp", "email"];

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const rows = await listSocialLinks();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { id?: string; network?: string; label?: string; value?: string; active?: boolean; displayOrder?: number; postUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const network = NETWORKS.includes(body.network as SocialNetwork) ? (body.network as SocialNetwork) : null;
  const value = String(body.value || "").trim();
  if (!network || !value) {
    return NextResponse.json({ error: "Network y URL/valor son requeridos" }, { status: 400 });
  }
  try {
    const row = await upsertSocialLink({
      id: body.id,
      network,
      label: body.label?.trim() || null,
      value,
      active: body.active ?? true,
      displayOrder: body.displayOrder ?? 0,
      postUrl: body.postUrl?.trim() || null,
    });
    return NextResponse.json(row);
  } catch (err) {
    console.error("upsert social link error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
