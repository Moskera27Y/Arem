/**
 * AREM WORLD — i18n configuration.
 * English is the default language; Spanish is secondary.
 * Locale lives in the URL (`/en`, `/es`) and is persisted via a cookie set by
 * the middleware, so the selected language survives navigation and sessions.
 */

export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const localeCookieName = "AREM_LOCALE";

/**
 * Strip a locale prefix from a pathname: `/en/shop` → `/shop`, `/en` → `/`.
 * Handles the bare-locale case exactly (no trailing slash, no subpath).
 */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|es)(\/|$)/);
  if (!match) return pathname;
  const separator = match[2];
  const after = pathname.slice(match[0].length);
  return separator === "/" ? `/${after}` : "/";
}
