/** Collections loading skeleton — hero + 2-col collection cards. */
"use client";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

export default function CollectionsLoading() {
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
          <div className="sk-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sk-card shimmer" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
