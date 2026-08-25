import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { deleteAddress, updateAddress } from "@/lib/server/customer-db";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  let profileId: string;
  try {
    ({ id: profileId } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: addressId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  try {
    const addr = await updateAddress(profileId, addressId, {
      recipient_name: body.recipient_name ? String(body.recipient_name) : "",
      phone: body.phone ? String(body.phone) : null,
      line1: body.line1 ? String(body.line1) : "",
      line2: body.line2 ? String(body.line2) : null,
      city: body.city ? String(body.city) : "",
      state: body.state ? String(body.state) : null,
      postal_code: body.postal_code ? String(body.postal_code) : null,
      country: body.country ? String(body.country) : "CO",
      is_default_shipping: body.is_default_shipping === true,
      is_default_billing: body.is_default_billing === true,
    });
    if (!addr) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(addr);
  } catch (err) {
    console.error("address update error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  let profileId: string;
  try {
    ({ id: profileId } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: addressId } = await params;
  try {
    await deleteAddress(profileId, addressId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("address delete error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
