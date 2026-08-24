import type { HomeSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { NewsletterForm } from "@/components/home/NewsletterForm";

interface NewsletterProps {
  section: Extract<HomeSection, { kind: "newsletter" }>;
  locale: Locale;
}

export function Newsletter({ section, locale }: NewsletterProps) {
  const dict = getDictionary(locale);
  return (
    <section className="newsletter">
      <div className="container section">
        <div className="newsletter__inner">
          <div>
            <span className="eyebrow" style={{ color: "var(--sand)" }}>
              {section.eyebrow}
            </span>
            <h2 className="h2 newsletter__title" style={{ marginTop: "0.9rem" }}>
              {section.title}
            </h2>
            <p className="newsletter__sub">{section.subtitle}</p>
          </div>
          <div>
            <NewsletterForm />
            <p className="newsletter__note">{dict.forms.newsletterNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
