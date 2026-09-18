import "server-only";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Pluggable email sender.
 * - If RESEND_API_KEY is set, uses Resend HTTP API.
 * - Else if SMTP_* vars are set, logs a stub (wire nodemailer when needed).
 * - Else logs to console (dev) so flows never crash for missing email config.
 */
export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<{ sent: boolean; provider: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "AREM WORLD <hola@arem.world>";

  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) throw new Error(`Email provider error ${res.status}`);
    return { sent: true, provider: "resend" };
  }

  console.log(`[email:stub] to=${to} subject=${subject}`);
  void html;
  void text;
  return { sent: false, provider: "log" };
}

export function resetEmailHtml(resetUrl: string, locale: string): string {
  const es = locale === "es";
  return `<p>${es ? "Recibimos una solicitud para restablecer tu contraseña." : "We received a password reset request."}</p><p><a href="${resetUrl}">${es ? "Restablecer contraseña" : "Reset password"}</a></p><p>${es ? "El enlace vence en 30 minutos." : "The link expires in 30 minutes."}</p>`;
}
