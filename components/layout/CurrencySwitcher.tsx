"use client";

import { useCurrency, DISPLAY_CURRENCIES } from "@/lib/currency/currency-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

/** Compact display-currency selector, separate from the EN | ES switch. */
export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const dict = getDictionary(useLocale());
  return (
    <select
      className="currency-switch"
      value={currency}
      onChange={(e) => setCurrency(e.target.value as (typeof DISPLAY_CURRENCIES)[number])}
      aria-label={dict.a11y.currency}
      title={dict.a11y.currency}
    >
      {DISPLAY_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
