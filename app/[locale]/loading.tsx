/** Route loading skeleton (App Router) — warm shimmer while sections stream. */
"use client";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

export default function LocaleLoading() {
  const dict = getDictionary(useLocale());
  return (
    <div aria-busy="true" aria-label={dict.account.loading}>
      <div className="sk-hero shimmer" />
      <div className="container">
        <div className="sk-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sk-chip shimmer" />
          ))}
        </div>
        <div className="sk-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sk-card shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
