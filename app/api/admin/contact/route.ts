import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getContact, updateContact } from "@/lib/server/site";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const contact = await getContact();
  return NextResponse.json(contact);
}

export async function PUT(req: NextRequest) {
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
  const bool = (k: string) => (typeof body[k] === "boolean" ? (body[k] as boolean) : undefined);
  try {
    const contact = await updateContact({
      title_en: str("title_en"), title_es: str("title_es"),
      intro_en: str("intro_en"), intro_es: str("intro_es"),
      email: str("email"), whatsapp: str("whatsapp"),
      address: str("address"), city: str("city"), country: str("country"),
      hours_en: str("hours_en"), hours_es: str("hours_es"),
      form_button_en: str("form_button_en"), form_button_es: str("form_button_es"),
      email_active: bool("email_active"), whatsapp_active: bool("whatsapp_active"),
      address_active: bool("address_active"), hours_active: bool("hours_active"),
    });
    return NextResponse.json(contact);
  } catch (err) {
    console.error("update contact error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
