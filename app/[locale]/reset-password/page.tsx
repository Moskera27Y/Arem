"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { AuthCard } from "@/components/customer/AuthCard";
import { notifyAuthChange } from "@/lib/customer/auth-client";

function ResetForm() {
  const params = useSearchParams();
  const locale = useLocale();
  const router = useRouter();
  const dict = getDictionary(locale);
  const a = dict.account;
  const prefix = `/${locale}`;
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (password !== confirm) {
      setError(locale === "es" ? "Las contraseñas no coinciden" : "Passwords don't match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/customer/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        notifyAuthChange();
        router.push(`${prefix}/account`);
        router.refresh();
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error || "Error");
      }
    } catch {
      setError("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={a.resetTitle} sub={a.resetSub}>
      {!token ? (
        <div className="acc-status acc-status--err">
          {locale === "es" ? "No se encontró el token." : "No token found."}
        </div>
      ) : (
        <form onSubmit={submit}>
          {error && <div className="acc-status acc-status--err">{error}</div>}
          <div className="acc-form__row">
            <div className="acc-field">
              <label htmlFor="rp-password">{a.newPassword}</label>
              <input id="rp-password" type="password" className="acc-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="acc-field">
              <label htmlFor="rp-confirm">{a.confirmPassword}</label>
              <input id="rp-confirm" type="password" className="acc-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? a.loading : a.resetPassword}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
