/** Shop loading skeleton — search, chips, toolbar and product cards. */
"use client";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

export default function ShopLoading() {
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
          <div className="shop-layout">
            <div>
              <div className="sk-line shimmer" style={{ width: "8rem", marginBottom: "1rem" }} />
              <div className="sk-row" style={{ padding: 0 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="sk-chip shimmer" style={{ width: "5rem", height: "2.5rem", borderRadius: "999px" }} />
                ))}
              </div>
            </div>
            <div className="sk-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="sk-card shimmer" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
