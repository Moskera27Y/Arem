"use client";

import { useCurrency, DISPLAY_CURRENCIES } from "@/lib/currency/currency-context";

/** Compact display-currency selector, separate from the EN | ES switch. */
export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  return (
    <select
      className="currency-switch"
      value={currency}
      onChange={(e) => setCurrency(e.target.value as (typeof DISPLAY_CURRENCIES)[number])}
      aria-label="Currency"
      title="Currency"
    >
      {DISPLAY_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
