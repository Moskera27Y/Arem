import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { q } from "@/lib/server/db";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE, signCustomerSession } from "@/lib/server/customer-auth";
import { mergeWishlist } from "@/lib/server/customer-db";
import { checkRateLimit, getClientKey } from "@/lib/server/rate-limit";
import { asEmail } from "@/lib/server/validate";

interface Row {
  id: string;
  email: string;
  password_hash: string;
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getClientKey(req, "signin"), 10, 10 * 60 * 1000);
  if (!rl.ok) {
    const res = NextResponse.json({ error: "Demasiados intentos, intenta más tarde" }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfter));
    return res;
  }
  let body: { email?: string; password?: string; wishlist?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const email = asEmail(body.email);
  const password = String(body.password || "");
  if (!email || !password || password.length > 72) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }
  try {
    const rows = await q<Row>("select id, email, password_hash from public.customer_profiles where email = $1", [email]);
    if (rows.length === 0) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

    const wishlist = Array.isArray(body.wishlist)
      ? body.wishlist.filter((x) => typeof x === "string" && x.length <= 128).slice(0, 100)
      : [];
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
