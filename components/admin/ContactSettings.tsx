"use client";

import { useEffect, useState } from "react";
import { Field, PageHead } from "@/components/admin/ui";

interface Cfg {
  id: number; title_en: string; title_es: string; intro_en: string; intro_es: string;
  email: string; whatsapp: string; address: string; city: string; country: string;
  hours_en: string; hours_es: string; form_button_en: string; form_button_es: string;
  email_active: boolean; whatsapp_active: boolean; address_active: boolean; hours_active: boolean;
}

const DEFAULT: Cfg = {
  id: 1, title_en: "Contact", title_es: "Contacto", intro_en: "", intro_es: "",
  email: "", whatsapp: "", address: "", city: "", country: "", hours_en: "", hours_es: "",
  form_button_en: "Send message", form_button_es: "Enviar mensaje",
  email_active: true, whatsapp_active: true, address_active: true, hours_active: true,
};

export function ContactSettings() {
  const [cfg, setCfg] = useState<Cfg>(DEFAULT);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/contact").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setCfg({ ...DEFAULT, ...d }); });
  }, []);

  const set = (k: keyof Cfg, v: unknown) => setCfg((c) => ({ ...c, [k]: v }));
  const str = (k: keyof Cfg) => (typeof cfg[k] === "string" ? (cfg[k] as string) : "");

  async function save() {
    setSaving(true); setStatus(null);
    try {
      const res = await fetch("/api/admin/contact", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) });
      setStatus(res.ok ? { ok: true, msg: "Guardado." } : { ok: false, msg: "Error al guardar." });
    } catch { setStatus({ ok: false, msg: "Error." }); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <PageHead title="Contact info" sub="Edita la información de contacto que muestra el sitio público." action={<span className="chip chip--published">Editable</span>} />
      {status && <div className={`form-status ${status.ok ? "form-status--ok" : "admin-form__error-summary"}`}>{status.msg}</div>}
      <div className="admin-card">
        <div className="admin-form">
          <div className="admin-form__grid admin-form__grid--2">
            <Field label="Title (EN)"><input className="input" value={str("title_en")} onChange={(e) => set("title_en", e.target.value)} /></Field>
            <Field label="Title (ES)"><input className="input" value={str("title_es")} onChange={(e) => set("title_es", e.target.value)} /></Field>
            <Field label="Intro (EN)"><textarea className="input" rows={3} value={str("intro_en")} onChange={(e) => set("intro_en", e.target.value)} /></Field>
            <Field label="Intro (ES)"><textarea className="input" rows={3} value={str("intro_es")} onChange={(e) => set("intro_es", e.target.value)} /></Field>
          </div>
          <h3 className="admin-form__section-title" style={{ marginTop: "1rem" }}>Details</h3>
          <div className="admin-form__grid admin-form__grid--2">
            <Field label="Email"><input className="input" value={str("email")} onChange={(e) => set("email", e.target.value)} /><label className="acc-check"><input type="checkbox" checked={cfg.email_active} onChange={(e) => set("email_active", e.target.checked)} /> Active</label></Field>
            <Field label="WhatsApp"><input className="input" value={str("whatsapp")} onChange={(e) => set("whatsapp", e.target.value)} /><label className="acc-check"><input type="checkbox" checked={cfg.whatsapp_active} onChange={(e) => set("whatsapp_active", e.target.checked)} /> Active</label></Field>
            <Field label="Address"><input className="input" value={str("address")} onChange={(e) => set("address", e.target.value)} /></Field>
            <Field label="City"><input className="input" value={str("city")} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="Country"><input className="input" value={str("country")} onChange={(e) => set("country", e.target.value)} /><label className="acc-check"><input type="checkbox" checked={cfg.address_active} onChange={(e) => set("address_active", e.target.checked)} /> Address active</label></Field>
            <Field label="Hours (EN)"><input className="input" value={str("hours_en")} onChange={(e) => set("hours_en", e.target.value)} /></Field>
            <Field label="Hours (ES)"><input className="input" value={str("hours_es")} onChange={(e) => set("hours_es", e.target.value)} /><label className="acc-check"><input type="checkbox" checked={cfg.hours_active} onChange={(e) => set("hours_active", e.target.checked)} /> Hours active</label></Field>
          </div>
          <h3 className="admin-form__section-title" style={{ marginTop: "1rem" }}>Form button</h3>
          <div className="admin-form__grid admin-form__grid--2">
            <Field label="Button text (EN)"><input className="input" value={str("form_button_en")} onChange={(e) => set("form_button_en", e.target.value)} /></Field>
            <Field label="Button text (ES)"><input className="input" value={str("form_button_es")} onChange={(e) => set("form_button_es", e.target.value)} /></Field>
          </div>
          <div className="admin-form__actions">
            <button type="button" className="btn btn--primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save contact"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
