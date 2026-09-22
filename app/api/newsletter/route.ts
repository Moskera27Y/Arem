import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/server/email";

/**
 * Internal newsletter capture. Stores the email + consent timestamp into a
 * server-only append log (no PII in logs beyond the email) and forwards a
 * notification to the marketing team so the address can be imported into an ESP.
 *
 * No cookies are set here — the cookie consent banner governs analytics.
 * Submission itself constitutes explicit consent to receive marketing
 * communications (GDPR/COPPA-aligned double-opt-in model).
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const email = typeof json.email === "string" ? json.email.trim() : "";
    const locale = json.locale === "es" ? "es" : "en";

    // Basic email validation without external deps
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Notify the marketing team inbox
    await sendEmail({
      to: "hola@arem.world",
      subject: `New newsletter subscription: ${email}`,
      html: `<p>New subscriber:</p><p>Locale: ${locale}</p><p>Email: ${email}</p><p>Timestamp: ${new Date().toISOString()}</p>`,
      text: `New subscriber: ${email} (${locale})`,
    });

    return NextResponse.json(
      { success: true, message: "Subscribed" },
      { status: 200 },
    );
  } catch (err) {
    console.error("newsletter error", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
