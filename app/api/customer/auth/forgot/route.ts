import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { q } from "@/lib/server/db";

/** Request a password reset. Generates a single-use token (30 min).
 * NOTE: no email provider is configured yet, so the reset link is returned to
 * the caller for testability. In production this link must be emailed, not
 * returned, before real-world use. */
export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  try {
    const rows = await q<{ id: string }>("select id from public.customer_profiles where email = $1", [email]);
    // Always respond ok to avoid account enumeration.
    if (rows.length === 0) return NextResponse.json({ ok: true });
    const token = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await q("update public.customer_profiles set reset_token_hash = $1, reset_token_expires_at = $2 where id = $3", [
      hash,
      expires,
      rows[0].id,
    ]);
    const origin = req.nextUrl.origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;
    return NextResponse.json({ ok: true, resetUrl });
  } catch (err) {
    console.error("forgot error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
