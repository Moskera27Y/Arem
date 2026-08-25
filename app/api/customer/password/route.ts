import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireCustomer } from "@/lib/server/customer-auth";
import { q } from "@/lib/server/db";

export async function PUT(req: NextRequest) {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  if (!body.currentPassword || !body.newPassword || body.newPassword.length < 8) {
    return NextResponse.json({ error: "Debes ingresar tu contraseña actual y una nueva de al menos 8 caracteres" }, { status: 400 });
  }
  try {
    const rows = await q<{ password_hash: string }>("select password_hash from public.customer_profiles where id = $1", [id]);
    if (rows.length === 0) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const ok = await bcrypt.compare(body.currentPassword, rows[0].password_hash);
    if (!ok) return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    const newHash = await bcrypt.hash(body.newPassword, 10);
    await q("update public.customer_profiles set password_hash = $1, updated_at = now() where id = $2", [newHash, id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("change password error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
