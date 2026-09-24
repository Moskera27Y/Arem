/** Account loading skeleton — covers profile/addresses/orders/security. */
"use client";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

export default function AccountLoading() {
  const dict = getDictionary(useLocale());
  return (
    <div className="section" aria-busy="true" aria-label={dict.account.loading}>
      <div className="container" style={{ maxWidth: "44rem" }}>
        <div className="sk-title shimmer" style={{ maxWidth: "20rem" }} />
        <div className="sk-line shimmer" style={{ marginTop: "1rem" }} />
        <div className="sk-line shimmer" style={{ marginTop: "0.75rem" }} />
        <div className="sk-line shimmer" style={{ marginTop: "0.75rem", width: "60%" }} />
      </div>
    </div>
  );
}
