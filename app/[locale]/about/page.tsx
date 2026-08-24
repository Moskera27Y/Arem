import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAboutContent } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Reveal } from "@/components/ui/Reveal";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const dict = getDictionary(locale);
  return {
    title: dict.nav.about,
    description: getAboutContent(locale).hero.sub,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  const content = getAboutContent(locale);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.about}</span>
          </nav>
          <p className="eyebrow page-hero__eyebrow">{content.hero.eyebrow}</p>
          <h1 className="page-hero__title">{content.hero.title}</h1>
          <p className="page-hero__sub">{content.hero.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split split--reverse">
            <div className="split__media">
              <Reveal>
                <ManagedImage src="/images/about-1.svg" alt={content.origin.title} />
              </Reveal>
            </div>
            <div>
              <p className="eyebrow split__kicker">{content.origin.eyebrow}</p>
              <h2 className="h2 split__title">{content.origin.title}</h2>
              <div className="split__body">
                {content.origin.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <blockquote className="quote">
                <p className="quote__text">“{content.origin.quote}”</p>
                <footer className="quote__author">— {content.origin.quoteAuthor}</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
            {content.values.title}
          </h2>
          <div className="value-grid">
            {content.values.values.map((value) => (
              <Reveal key={value.num}>
                <div className="value-item">
                  <span className="value-item__num">{value.num}</span>
                  <h3 className="value-item__title">{value.title}</h3>
                  <p className="value-item__text">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container text-center">
          <h2 className="h2" style={{ marginBottom: "1rem" }}>
            {content.cta.title}
          </h2>
          <p className="muted" style={{ marginBottom: "2rem", maxWidth: "34rem", marginInline: "auto" }}>
            {content.cta.sub}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`${localePrefix}/stories`} className="btn btn--primary">
              {content.cta.stories}
            </Link>
            <Link href={`${localePrefix}/shop`} className="btn btn--secondary">
              {content.cta.shop}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
