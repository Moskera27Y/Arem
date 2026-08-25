"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteConfig } from "@/lib/content";
import { ContactForm } from "@/components/forms/ContactForm";

interface Cfg {
  title_en?: string | null; title_es?: string | null; intro_en?: string | null; intro_es?: string | null;
  email?: string | null; whatsapp?: string | null; address?: string | null; city?: string | null; country?: string | null;
  hours_en?: string | null; hours_es?: string | null; form_button_en?: string | null; form_button_es?: string | null;
  email_active?: boolean; whatsapp_active?: boolean; address_active?: boolean; hours_active?: boolean;
}

export function ContactDetails() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const prefix = `/${locale}`;
  const site = getSiteConfig(locale);
  const siteContact = site.footer.contact;

  const [cfg, setCfg] = useState<Cfg | null>(null);
  useEffect(() => {
    fetch("/api/contact").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setCfg(d); });
  }, []);

  const s = (es: keyof Cfg, fb: string) => (cfg && cfg[es] ? String(cfg[es]) : fb);
  const active = (k: keyof Cfg, def: boolean) => (cfg ? (cfg[k] as boolean) : def);

  const title = s("title_en", dict.contact.title);
  const intro = s("intro_en", dict.contact.sub);
  const email = active("email_active", true) ? s("email", siteContact.find((c) => c.label === "Email")?.value ?? "hola@arem.world") : null;
  const whatsapp = active("whatsapp_active", true) ? s("whatsapp", siteContact.find((c) => c.label === "WhatsApp")?.value ?? "+57 300 123 4567") : null;
  const addressParts = active("address_active", true)
    ? [s("address", siteContact.find((c) => c.label === "Bogotá · Colombia")?.value ?? "Carrera 7 # 45-12"), s("city", "Bogotá"), s("country", "Colombia")].filter(Boolean)
    : [];
  const hours = active("hours_active", true) ? s("hours_en", dict.contact.hoursValue) : null;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <Link href={prefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.contact}</span>
          </nav>
          <p className="eyebrow page-hero__eyebrow">{dict.contact.eyebrow}</p>
          <h1 className="page-hero__title">{title}</h1>
          <p className="page-hero__sub">{intro}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <h2 className="h2" style={{ marginBottom: "1rem" }}>{dict.contact.otherWays}</h2>
              <p className="muted" style={{ maxWidth: "24rem" }}>{dict.contact.otherWaysSub}</p>
              <div className="contact-list">
                {email && <div className="contact-item"><span className="contact-item__label">Email</span><div className="contact-item__value">{email}</div></div>}
                {whatsapp && <div className="contact-item"><span className="contact-item__label">WhatsApp</span><div className="contact-item__value">{whatsapp}</div></div>}
                {addressParts.length > 0 && <div className="contact-item"><span className="contact-item__label">{locale === "es" ? "Dirección" : "Address"}</span><div className="contact-item__value">{addressParts.join(" · ")}</div></div>}
                {hours && <div className="contact-item"><span className="contact-item__label">{dict.contact.hours}</span><div className="contact-item__value">{hours}</div></div>}
              </div>
            </div>
            <div>
              <h2 className="h2" style={{ marginBottom: "1.5rem" }}>{dict.contact.sendMessage}</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
