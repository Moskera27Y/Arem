/** Collection detail loading skeleton — editorial hero + product grid. */
"use client";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

export default function CollectionDetailLoading() {
  const dict = getDictionary(useLocale());
  return (
    <div className="section" aria-busy="true" aria-label={dict.account.loading}>
      <div className="container">
        <div className="sk-card shimmer" style={{ aspectRatio: "21 / 9" }} />
        <div className="sk-title shimmer" style={{ marginTop: "2rem", maxWidth: "28rem" }} />
        <div className="sk-line shimmer" style={{ marginTop: "1rem", maxWidth: "40rem" }} />
        <div className="sk-grid" style={{ marginTop: "2.5rem" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sk-card shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
