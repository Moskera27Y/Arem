import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { q } from "@/lib/server/db";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE, signCustomerSession } from "@/lib/server/customer-auth";
import { mergeWishlist } from "@/lib/server/customer-db";
import { checkRateLimit, getClientKey } from "@/lib/server/rate-limit";
import { asEmail, asString } from "@/lib/server/validate";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getClientKey(req, "signup"), 5, 60 * 60 * 1000);
  if (!rl.ok) {
    const res = NextResponse.json({ error: "Demasiados registros, intenta más tarde" }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfter));
    return res;
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const email = asEmail(body.email);
  const password = String(body.password || "");
  if (!email) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: "La contraseña debe tener entre 8 y 72 caracteres" }, { status: 400 });
  }
  try {
    const existing = await q("select id from public.customer_profiles where email = $1", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya existe una cuenta con este email" }, { status: 409 });
    }
    const hash = await bcrypt.hash(password, 12);
    const currency = ["USD", "COP", "EUR", "GBP", "CAD"].includes(String(body.display_currency)) ? String(body.display_currency) : "USD";
    const firstName = asString(body.first_name, 100) || null;
    const lastName = asString(body.last_name, 100) || null;
    const phone = asString(body.phone, 30) || null;
    const lang = asString(body.preferred_language, 10) || "en";
    const rows = await q<{ id: string }>(
      `insert into public.customer_profiles (email, password_hash, first_name, last_name, phone, preferred_language, display_currency)
       values ($1, $2, $3, $4, $5, $6, $7) returning id`,
      [email, hash, firstName, lastName, phone, lang, currency],
    );
    const id = rows[0].id;
    const wishlist = Array.isArray(body.wishlist)
      ? (body.wishlist as unknown[]).filter((x): x is string => typeof x === "string" && x.length <= 128).slice(0, 100)
      : [];
    if (wishlist.length) await mergeWishlist(id, wishlist);

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
