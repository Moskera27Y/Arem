import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { ManagedImage } from "@/components/ui/ManagedImage";

interface HeroProps {
  section: Extract<HomeSection, { kind: "hero" }>;
  locale: Locale;
}

/**
 * Immersive full-width hero — copy on the left over large photography, with
 * an editorial serif headline, a warm-gold italic accent and two CTAs.
 */
export function Hero({ section, locale }: HeroProps) {
  const dict = getDictionary(locale);
  return (
    <section className="hero">
      <div className="hero__media">
        <ManagedImage src={section.image.src} alt={section.image.alt} priority />
      </div>
      <div className="hero__content">
        <p className="hero__eyebrow">{section.eyebrow}</p>
        <h1 className="hero__title">
          {section.title} <em>{section.titleAccent}</em>
        </h1>
        <p className="hero__sub">{section.subtitle}</p>
        <div className="hero__actions">
          <Link href={`/${locale}${section.primaryCta.href}`} className="btn btn--gold-dark btn--lg">
            {section.primaryCta.label}
          </Link>
          <Link href={`/${locale}${section.secondaryCta.href}`} className="text-link">
            {section.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
