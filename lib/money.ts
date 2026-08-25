/**
 * AREM WORLD — money & display-currency core.
 *
 * All base prices are managed in USD only. The display currency is a customer
 * preference; non-USD prices are ESTIMATED conversions and are never the
 * final charge. USD monetary math uses integer cents to avoid float errors.
 *
 * Extensible: add a code to SUPPORTED_CURRENCIES + CURRENCY_META to extend.
 */

export const SUPPORTED_CURRENCIES = ["USD", "COP", "EUR", "GBP", "CAD"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "USD";

interface CurrencyMeta {
  /** Exact display prefix used by formatCurrency (matches product spec). */
  symbol: string;
  /** Locale used for grouping/decimals. */
  locale: string;
  decimals: number;
}

/** Currency metadata for the supported display currencies. */
export const CURRENCY_META: Record<Currency, CurrencyMeta> = {
  USD: { symbol: "$", locale: "en-US", decimals: 2 },
  COP: { symbol: "COP $", locale: "de-DE", decimals: 0 },
  EUR: { symbol: "€", locale: "en-US", decimals: 2 },
  GBP: { symbol: "£", locale: "en-US", decimals: 2 },
  CAD: { symbol: "CA$", locale: "en-US", decimals: 2 },
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

/** USD main unit -> integer cents. */
export function toCents(amountUsd: number): number {
  return Math.round(amountUsd * 100);
}

/** Integer cents -> USD main unit. */
export function fromCents(cents: number): number {
  return cents / 100;
}

/** Convert a USD main-unit amount to a display currency (estimate). */
export function convertUsd(amountUsd: number, currency: Currency, rate: number): number {
  if (currency === "USD") return amountUsd;
  if (!rate || !Number.isFinite(rate) || rate <= 0) return amountUsd;
  return amountUsd * rate;
}

/** Format a value in a display currency to the exact spec format. */
export function formatCurrency(amount: number, currency: Currency): string {
  const meta = CURRENCY_META[currency];
  const grouped = amount.toLocaleString(meta.locale, {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  });
  return `${meta.symbol}${grouped}`;
}

/** Convenience: convert a USD amount to a display currency and format it. */
export function formatUsd(amountUsd: number, currency: Currency, rate: number): string {
  return formatCurrency(convertUsd(amountUsd, currency, rate), currency);
}

/** Round-trip helper for display snapping (keeps integer-cents math on USD). */
export function roundCents(cents: number): number {
  return Math.round(cents);
}
