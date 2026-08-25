"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCurrency } from "@/lib/currency/currency-context";
import type { CustomerProfile } from "@/lib/server/customer-db";

export function ProfileForm({ profile }: { profile: CustomerProfile }) {
  const router = useRouter();
  const locale = useLocale();
  const dict = getDictionary(locale);
  const a = dict.account;
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [lang, setLang] = useState(profile.preferred_language === "es" ? "es" : "en");
  const { currency, setCurrency } = useCurrency();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, phone, preferred_language: lang }),
      });
      if (res.ok) {
        setStatus({ ok: true, message: a.profileSaved });
        router.refresh();
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
        <h1>{a.profileTitle}</h1>
        <p>{a.profileSub}</p>
      </div>
      {status && <div className={`acc-status ${status.ok ? "acc-status--ok" : "acc-status--err"}`}>{status.message}</div>}
      <form onSubmit={save}>
        <div className="acc-form__row">
          <div className="acc-field">
            <label htmlFor="pf-first">{a.firstName}</label>
            <input id="pf-first" className="acc-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="acc-field">
            <label htmlFor="pf-last">{a.lastName}</label>
            <input id="pf-last" className="acc-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="acc-form__row">
          <div className="acc-field">
            <label htmlFor="pf-email">{a.email}</label>
            <input id="pf-email" className="acc-input" value={profile.email} readOnly disabled />
            <span className="acc-note">…</span>
          </div>
          <div className="acc-field">
            <label htmlFor="pf-phone">{a.phone}</label>
            <input id="pf-phone" className="acc-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="acc-field">
          <label htmlFor="pf-lang">{a.preferredLanguage}</label>
          <select id="pf-lang" className="acc-input" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">{a.languageEn}</option>
            <option value="es">{a.languageEs}</option>
          </select>
        </div>
        <div className="acc-field">
          <label htmlFor="pf-currency">{locale === "es" ? "Moneda" : "Currency"}</label>
          <select id="pf-currency" className="acc-input" value={currency} onChange={(e) => setCurrency(e.target.value as never)}>
            <option value="USD">USD</option>
            <option value="COP">COP</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
          <span className="acc-note">{locale === "es" ? "Solo cambia la visualización. El pago siempre se cobra en USD." : "Display only. Payment is always charged in USD."}</span>
        </div>
        <div className="acc-form__actions">
          <button type="submit" className="btn--primary" disabled={saving}>
            {saving ? a.saving : a.save}
          </button>
        </div>
      </form>
    </div>
  );
}
