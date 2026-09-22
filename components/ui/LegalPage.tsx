"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/i18n/locale-context";

interface LegalSection {
  title: string;
  body: string | string[];
}

interface LegalPageProps {
  sections: LegalSection[];
  lastUpdated: string;
}

/**
 * Generic bilingual legal page renderer. Uses the active locale context to
 * decide nothing about content — content is pre-resolved server-side and passed
 * as already-translated strings. This component only handles the shared layout
 * and semantic structure so every legal page stays accessible and consistent.
 */
export function LegalPage({ sections, lastUpdated }: LegalPageProps) {
  const locale = useLocale();

  // Ensure the page scrolls to top on locale change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [locale]);

  return (
    <article className="legal">
      <div className="legal__container container">
        {sections.map((section) => (
          <section key={section.title} className="legal__section">
            <h2 className="legal__title">{section.title}</h2>
            {Array.isArray(section.body) ? (
              section.body.map((p, i) => (
                <p key={i} className="legal__para">
                  {p}
                </p>
              ))
            ) : (
              <p className="legal__para">{section.body}</p>
            )}
          </section>
        ))}

        <footer className="legal__meta">
          <p className="legal__updated">
            {locale === "es"
              ? `Última actualización: ${lastUpdated}`
              : `Last updated: ${lastUpdated}`}
          </p>
          <p className="legal__contact">
            {locale === "es"
              ? "¿Preguntas? Escríbenos a "
              : "Questions? Email "}{" "}
            <a
              href="mailto:hola@arem.world"
              className="legal__email"
              aria-label={locale === "es" ? "Correo electrónico de contacto" : "Contact email"}
            >
              hola@arem.world
            </a>
          </p>
        </footer>
      </div>
    </article>
  );
}
