"use client";

import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

/**
 * Client-side error boundary for a given locale route segment.
 * Renders a graceful 500 fallback with a link back home and a way to
 * retry the navigation — never a raw blank screen.
 */
export default function LocaleError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  // eslint-disable-next-line no-console
  console.error(error);

  return (
    <section
      className="section"
      style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}
    >
      <div className="container text-center">
        <p
          className="eyebrow eyebrow--center"
          style={{ justifyContent: "center" }}
        >
          {dict.notFound.code}
        </p>
        <h1 className="display" style={{ marginTop: "1rem" }}>
          {locale === "es"
            ? "Algo salió mal"
            : "Something went wrong"}
        </h1>
        <p
          className="muted"
          style={{ maxWidth: "32rem", margin: "1.25rem auto 2rem" }}
        >
          {locale === "es"
            ? "No pudimos cargar esta página. Inténtalo de nuevo o vuelve al inicio."
            : "We couldn't load this page. Give it another shot or head back home."}
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href={localePrefix} className="btn btn--primary">
            {dict.notFound.home}
          </Link>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => window.location.reload()}
            aria-label={locale === "es" ? "Recargar página" : "Reload page"}
          >
            {locale === "es" ? "Recargar" : "Reload"}
          </button>
        </div>
      </div>
    </section>
  );
}

