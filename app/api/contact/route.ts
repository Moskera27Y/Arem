import { NextResponse, type NextRequest } from "next/server";
import { q } from "@/lib/server/db";
import { sendEmail } from "@/lib/server/email";
import { checkRateLimit, getClientKey } from "@/lib/server/rate-limit";
import { getContact } from "@/lib/server/site";

export const dynamic = "force-dynamic";

/** CMS contact config (used by the admin contact panel). */
export async function GET() {
  try {
    const contact = await getContact();
    return NextResponse.json(contact, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("get contact error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}

const TOPICS = new Set(["order", "product", "artisan", "wholesale", "other"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Real contact inbox.
 * - Validates + rate-limits (5/hour per IP).
 * - Persists every message to `contact_messages` (source of truth).
 * - Best-effort email notification via Resend when configured.
 * - Returns success ONLY when the message was stored (no fake confirmations).
 */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getClientKey(req, "contact"), 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 100) : "";
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 200) : "";
  const topic = typeof b.topic === "string" && TOPICS.has(b.topic) ? b.topic : "other";
  const message = typeof b.message === "string" ? b.message.trim().slice(0, 2000) : "";
  const locale = b.locale === "es" ? "es" : "en";
  const consent = b.consent === true;

  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10 || !consent) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  try {
    const rows = await q<{ id: string }>(
      `INSERT INTO public.contact_messages (name, email, topic, message, locale)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, email, topic, message, locale],
    );
    const id = rows[0]?.id;
    if (!id) throw new Error("insert returned no id");

    // Best-effort inbox notification (Resend when configured, else skipped)
    let emailSent = false;
    try {
      const r = await sendEmail({
        to: "hola@arem.world",
        subject: `Contacto [${topic}]: ${name}`,
        html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt; (${locale})</p><p>Tema: ${escapeHtml(topic)}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p><p>ID: ${escapeHtml(id)}</p>`,
        text: `${name} <${email}> (${locale}) [${topic}]\n\n${message}\n\nID: ${id}`,
      });
      emailSent = r.sent;
      if (emailSent) {
        await q(`UPDATE public.contact_messages SET email_sent = true WHERE id = $1`, [id]);
      }
    } catch (mailErr) {
      console.error("contact notify error", mailErr instanceof Error ? mailErr.message : "unknown");
    }

    return NextResponse.json({ success: true, id, emailSent }, { status: 200 });
  } catch (err) {
    console.error("contact error", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
