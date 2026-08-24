import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ContactForm } from "@/components/forms/ContactForm";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const dict = getDictionary(locale);
  return { title: dict.nav.contact, description: dict.contact.sub };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  const { contact } = getSiteConfig(locale).footer;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.contact}</span>
          </nav>
          <p className="eyebrow page-hero__eyebrow">{dict.contact.eyebrow}</p>
          <h1 className="page-hero__title">{dict.contact.title}</h1>
          <p className="page-hero__sub">{dict.contact.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <h2 className="h2" style={{ marginBottom: "1rem" }}>
                {dict.contact.otherWays}
              </h2>
              <p className="muted" style={{ maxWidth: "24rem" }}>
                {dict.contact.otherWaysSub}
              </p>
              <div className="contact-list">
                {contact.map((item) => (
                  <div key={item.label} className="contact-item">
                    <span className="contact-item__label">{item.label}</span>
                    <div className="contact-item__value">{item.value}</div>
                  </div>
                ))}
                <div className="contact-item">
                  <span className="contact-item__label">{dict.contact.hours}</span>
                  <div className="contact-item__value">{dict.contact.hoursValue}</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="h2" style={{ marginBottom: "1.5rem" }}>
                {dict.contact.sendMessage}
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
