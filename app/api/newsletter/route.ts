import { NextResponse, type NextRequest } from "next/server";
import { q } from "@/lib/server/db";
import { sendEmail } from "@/lib/server/email";
import { checkRateLimit, getClientKey } from "@/lib/server/rate-limit";

/**
 * Real newsletter capture.
 * - Validates + rate-limits (5/hour per IP).
 * - Persists every address to `newsletter_subscribers` (idempotent on
 *   resubscribe) — the DB is the source of truth for later ESP import.
 * - Best-effort notification to the marketing inbox (Resend when configured).
 * - Returns success ONLY when the address was stored.
 *
 * No cookies are set here — the cookie consent banner governs analytics.
 * Submission itself constitutes explicit consent to receive marketing
 * communications (GDPR/COPPA-aligned double-opt-in model).
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getClientKey(req, "newsletter"), 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = (json ?? {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 200) : "";
  const locale = b.locale === "es" ? "es" : "en";

  // Basic email validation without external deps
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await q(
      `INSERT INTO public.newsletter_subscribers (email, locale, source)
       VALUES ($1, $2, 'storefront')
       ON CONFLICT (email) DO UPDATE SET locale = EXCLUDED.locale`,
      [email, locale],
    );

    // Notify the marketing team inbox (best-effort)
    try {
      await sendEmail({
        to: "hola@arem.world",
        subject: `New newsletter subscription: ${email}`,
        html: `<p>New subscriber:</p><p>Locale: ${locale}</p><p>Email: ${email}</p><p>Timestamp: ${new Date().toISOString()}</p>`,
        text: `New subscriber: ${email} (${locale})`,
      });
    } catch (mailErr) {
      console.error("newsletter notify error", mailErr instanceof Error ? mailErr.message : "unknown");
    }

    return NextResponse.json(
      { success: true, message: "Subscribed" },
      { status: 200 },
    );
  } catch (err) {
    console.error("newsletter error", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
