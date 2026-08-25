"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function SecurityForm() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const a = dict.account;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (next !== confirm) {
      setStatus({ ok: false, message: locale === "es" ? "Las contraseñas no coinciden" : "Passwords don't match" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/customer/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (res.ok) {
        setStatus({ ok: true, message: a.passwordChanged });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({ ok: false, message: d.error || "Error" });
      }
    } catch {
      setStatus({ ok: false, message: "Error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="account__card">
      <div className="account__heading">
        <h1>{a.securityTitle}</h1>
        <p>{a.securitySub}</p>
      </div>
      {status && <div className={`acc-status ${status.ok ? "acc-status--ok" : "acc-status--err"}`}>{status.message}</div>}
      <form onSubmit={submit}>
        <div className="acc-field">
          <label htmlFor="sec-current">{a.currentPassword}</label>
          <input id="sec-current" type="password" className="acc-input" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div className="acc-form__row">
          <div className="acc-field">
            <label htmlFor="sec-new">{a.newPassword}</label>
            <input id="sec-new" type="password" className="acc-input" value={next} onChange={(e) => setNext(e.target.value)} required />
          </div>
          <div className="acc-field">
            <label htmlFor="sec-confirm">{a.confirmPassword}</label>
            <input id="sec-confirm" type="password" className="acc-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
        </div>
        <div className="acc-form__actions">
          <button type="submit" className="btn--primary" disabled={saving}>
            {saving ? a.saving : a.changePassword}
          </button>
        </div>
      </form>
    </div>
  );
}
