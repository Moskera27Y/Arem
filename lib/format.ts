import type { Money } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

const COP_LOCALE = "es-CO";
const USD_LOCALE = "en-US";

/**
 * Format a Money value for display. COP uses Colombian formatting
 * ($ 320.000), USD uses standard US formatting.
 */
export function formatMoney(money: Money): string {
  const { amount, currency } = money;
  const locale = currency === "COP" ? COP_LOCALE : USD_LOCALE;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "COP" ? 0 : 2,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(amount);
}

/** Compact COP formatting for tight spaces, e.g. "$320.000". */
export function formatMoneyCompact(money: Money): string {
  const { amount, currency } = money;
  if (currency !== "COP") return formatMoney(money);
  return `$${amount.toLocaleString("es-CO")}`;
}

/** Discount percentage between compare-at and current price, if any. */
export function discountPercent(money: Money, compareAt?: Money): number | null {
  if (!compareAt || compareAt.amount <= money.amount) return null;
  return Math.round(((compareAt.amount - money.amount) / compareAt.amount) * 100);
}

const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  es: "es-CO",
};

/** Human date in the active language, e.g. "22 de enero de 2026" / "January 22, 2026". */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
