import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { updateProfile } from "@/lib/server/customer-db";
import { asString } from "@/lib/server/validate";

export async function PUT(req: NextRequest) {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { first_name?: string; last_name?: string; phone?: string; preferred_language?: string; display_currency?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const lang = body.preferred_language === "es" ? "es" : "en";
  const currency = ["USD", "COP", "EUR", "GBP", "CAD"].includes(String(body.display_currency)) ? String(body.display_currency) : "USD";
  try {
    const profile = await updateProfile(id, {
      first_name: asString(body.first_name, 100) || null,
      last_name: asString(body.last_name, 100) || null,
      phone: asString(body.phone, 30) || null,
      preferred_language: lang,
      display_currency: currency,
    });
    return NextResponse.json(profile);
  } catch (err) {
    console.error("profile update error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
