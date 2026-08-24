import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { q } from "@/lib/server/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/server/auth";

interface AdminRow {
  email: string;
  password_hash: string;
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  try {
    const rows = await q<AdminRow>("select email, password_hash from public.admin_users where email = $1", [email]);
    if (rows.length === 0) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

    const token = signSession(rows[0].email);
    const res = NextResponse.json({ ok: true, email: rows[0].email });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
