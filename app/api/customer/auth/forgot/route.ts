import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { q } from "@/lib/server/db";
import { checkRateLimit, getClientKey } from "@/lib/server/rate-limit";
import { asEmail } from "@/lib/server/validate";
import { resetEmailHtml, sendEmail } from "@/lib/server/email";

/** Base URL for emailed links. Prefers the configured site URL; the request
 * origin is only accepted when its host matches the allowlist (prevents
 * Host-header poisoning of reset links). */
function siteBaseUrl(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const host = req.nextUrl.host.toLowerCase();
  const allowed =
    host === "localhost:3000" ||
    host.endsWith(".vercel.app") ||
    (process.env.ALLOWED_HOSTS ?? "").split(",").some((h) => h.trim().toLowerCase() === host);
  if (allowed) return `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  throw new Error("Site URL not configured");
}

/** Request a password reset. Generates a single-use token (30 min).
 * Sends the link by email when configured. Response is identical
 * whether the account exists or not to avoid account enumeration. */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getClientKey(req, "forgot"), 5, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ ok: true });
  let body: { email?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const email = asEmail(body.email);
  if (!email) return NextResponse.json({ ok: true });
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
    const locale = String(body.locale === "es" ? "es" : "en");
    const base = siteBaseUrl(req);
    const resetUrl = `${base}/${locale}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: locale === "es" ? "Restablece tu contraseña — AREM WORLD" : "Reset your password — AREM WORLD",
      html: resetEmailHtml(resetUrl, locale),
      text: resetUrl,
    }).catch((e) => console.error("reset email error", e));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("forgot error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
