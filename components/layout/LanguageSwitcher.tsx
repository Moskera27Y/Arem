"use client";

import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, localeNames, locales, stripLocale, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * EN | ES language selector. Navigates to the identical path under the other
 * locale, preserving any query parameters. The choice is written to the
 * AREM_LOCALE cookie immediately (the middleware also refreshes it), so the
 * language persists across navigation, refresh and future visits.
 */
export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const dict = getDictionary(locale);

  const switchTo = (target: Locale) => {
    if (target === locale) return;
    try {
      document.cookie = `${localeCookieName}=${target}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    } catch {
      /* cookies unavailable — the URL prefix still carries the locale */
    }
    const rest = stripLocale(pathname);
    const query = typeof window !== "undefined" ? window.location.search : "";
    router.push(`/${target}${rest === "/" ? "" : rest}${query}`);
  };

  return (
    <div className="lang-switch" role="group" aria-label={dict.a11y.language}>
      {locales.map((item, index) => (
        <span key={item} className="lang-switch__item">
          {index > 0 && <span className="lang-switch__sep" aria-hidden="true" />}
          <button
            type="button"
            className={`lang-switch__btn${item === locale ? " is-active" : ""}`}
            aria-pressed={item === locale}
            aria-label={item === "en" ? "English" : "Español"}
            onClick={() => switchTo(item)}
          >
            {localeNames[item]}
          </button>
        </span>
      ))}
    </div>
  );
}
