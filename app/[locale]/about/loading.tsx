/** About loading skeleton — hero + split story + values. */
"use client";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

export default function AboutLoading() {
  const dict = getDictionary(useLocale());
  return (
    <div aria-busy="true" aria-label={dict.account.loading}>
      <div className="page-hero">
        <div className="container">
          <div className="sk-line shimmer" style={{ width: "12rem" }} />
          <div className="sk-title shimmer" />
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="sk-card shimmer" style={{ aspectRatio: "21 / 8" }} />
          <div className="sk-row" style={{ padding: "2rem 0 0" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="sk-card shimmer" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
