import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { updateProfile } from "@/lib/server/customer-db";

export async function PUT(req: NextRequest) {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { first_name?: string; last_name?: string; phone?: string; preferred_language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const lang = body.preferred_language === "es" ? "es" : "en";
  try {
    const profile = await updateProfile(id, {
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      phone: body.phone ?? null,
      preferred_language: lang,
    });
    return NextResponse.json(profile);
  } catch (err) {
    console.error("profile update error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
