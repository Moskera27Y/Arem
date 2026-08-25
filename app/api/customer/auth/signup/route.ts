import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { q } from "@/lib/server/db";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE, signCustomerSession } from "@/lib/server/customer-auth";
import { mergeWishlist } from "@/lib/server/customer-db";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }
  try {
    const existing = await q("select id from public.customer_profiles where email = $1", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya existe una cuenta con este email" }, { status: 409 });
    }
    const hash = await bcrypt.hash(password, 10);
    const rows = await q<{ id: string }>(
      `insert into public.customer_profiles (email, password_hash, first_name, last_name, phone, preferred_language)
       values ($1, $2, $3, $4, $5, $6) returning id`,
      [email, hash, body.first_name || null, body.last_name || null, body.phone || null, body.preferred_language || "en"],
    );
    const id = rows[0].id;
    const wishlist = Array.isArray(body.wishlist) ? (body.wishlist as unknown[]).filter((x) => typeof x === "string") : [];
    if (wishlist.length) await mergeWishlist(id, wishlist as string[]);

    const token = signCustomerSession(email);
    const res = NextResponse.json({ ok: true, email }, { status: 201 });
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CUSTOMER_SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
