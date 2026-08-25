import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { q } from "@/lib/server/db";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE, signCustomerSession } from "@/lib/server/customer-auth";
import { mergeWishlist } from "@/lib/server/customer-db";

interface Row {
  id: string;
  email: string;
  password_hash: string;
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; wishlist?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  try {
    const rows = await q<Row>("select id, email, password_hash from public.customer_profiles where email = $1", [email]);
    if (rows.length === 0) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

    const wishlist = Array.isArray(body.wishlist) ? body.wishlist.filter((x) => typeof x === "string") : [];
    if (wishlist.length) await mergeWishlist(rows[0].id, wishlist);

    const token = signCustomerSession(rows[0].email);
    const res = NextResponse.json({ ok: true, email: rows[0].email });
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CUSTOMER_SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error("customer signin error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
