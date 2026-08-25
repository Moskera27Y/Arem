"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { AuthCard } from "@/components/customer/AuthCard";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const a = dict.account;
  const prefix = `/${locale}`;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string; resetUrl?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/customer/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; resetUrl?: string };
      if (data.ok) {
        setStatus({
          ok: true,
          message: locale === "es" ? "Revisa tu correo para restablecer la contraseña." : "Check your email to reset your password.",
          resetUrl: data.resetUrl,
        });
      } else {
        setStatus({ ok: false, message: "Error" });
      }
    } catch {
      setStatus({ ok: false, message: "Error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={a.forgotTitle} sub={a.forgotSub}>
      <form onSubmit={submit}>
        {status && (
          <div className={`acc-status ${status.ok ? "acc-status--ok" : "acc-status--err"}`}>
            {status.message}
            {status.resetUrl && (
              <>
                {" "}
                <Link href={status.resetUrl}>{a.resetTitle}</Link>
              </>
            )}
          </div>
        )}
        <div className="acc-field">
          <label htmlFor="fg-email">{a.email}</label>
          <input id="fg-email" type="email" className="acc-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? a.loading : locale === "es" ? "Enviar enlace" : "Send link"}
        </button>
      </form>
      <p className="auth-caret">
        <Link href={`${prefix}/signin`}>{a.signIn}</Link>
      </p>
    </AuthCard>
  );
}
