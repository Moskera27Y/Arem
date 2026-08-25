import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { createAddress, listAddresses } from "@/lib/server/customer-db";

export async function GET() {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const rows = await listAddresses(id);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const recipient = String(body.recipient_name || "").trim();
  const line1 = String(body.line1 || "").trim();
  const city = String(body.city || "").trim();
  const country = String(body.country || "CO").trim();
  if (!recipient || !line1 || !city || !country) {
    return NextResponse.json({ error: "Faltan campos obligatorios (destinatario, dirección, ciudad, país)" }, { status: 400 });
  }
  try {
    const addr = await createAddress(id, {
      recipient_name: recipient,
      phone: body.phone ? String(body.phone) : null,
      line1,
      line2: body.line2 ? String(body.line2) : null,
      city,
      state: body.state ? String(body.state) : null,
      postal_code: body.postal_code ? String(body.postal_code) : null,
      country,
      is_default_shipping: body.is_default_shipping === true,
      is_default_billing: body.is_default_billing === true,
    });
    return NextResponse.json(addr, { status: 201 });
  } catch (err) {
    console.error("address create error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
