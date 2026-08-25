import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { q } from "@/lib/server/db";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE, signCustomerSession } from "@/lib/server/customer-auth";

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (!token || password.length < 8) {
    return NextResponse.json({ error: "Token o contraseña inválidos" }, { status: 400 });
  }
  const hash = createHash("sha256").update(token).digest("hex");
  try {
    const rows = await q<{ id: string; email: string }>(
      "select id, email from public.customer_profiles where reset_token_hash = $1 and reset_token_expires_at > now()",
      [hash],
    );
    if (rows.length === 0) return NextResponse.json({ error: "Enlace inválido o vencido" }, { status: 400 });
    const newHash = await bcrypt.hash(password, 10);
    await q(
      "update public.customer_profiles set password_hash = $1, reset_token_hash = null, reset_token_expires_at = null, updated_at = now() where id = $2",
      [newHash, rows[0].id],
    );
    const token2 = signCustomerSession(rows[0].email);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(CUSTOMER_COOKIE, token2, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CUSTOMER_SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error("reset error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
