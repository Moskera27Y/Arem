"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "arem_cookie_consent";

type Consent = "granted" | "denied" | "partial";

export function CookieBanner() {
  const locale = useLocale() as "en" | "es";
  const [reduceMotion, setReduceMotion] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as Consent | null;
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
    setConsent(stored);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleSave = (c: Consent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, c);
    if (c === "granted" && typeof window !== "undefined" && (window as Window & { va?: (a: string, b: string) => void }).va) {
      (window as Window & { va?: (a: string, b: string) => void }).va?.("consent", "granted");
    }
    setConsent(c);
    setVisible(false);
  };

  if (consent !== null || !visible) return null;

  const c = getDictionary(locale).cookie;

  return (
    <div
      className={`cookie-banner ${reduceMotion ? "" : "cookie-banner--enter"}`}
      role="dialog"
      aria-live="polite"
      aria-label={c.preferences}
    >
      <div className="cookie-banner__text">
        {c.text}
        <Link href={`/${locale}/cookies`} className="cookie-banner__link">
          {c.policy}
        </Link>
      </div>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="btn btn--sm btn--ghost cookie-banner__btn"
          onClick={() => handleSave("partial")}
          aria-label={c.rejectAria}
        >
          {c.reject}
        </button>
        <button
          type="button"
          className="btn btn--sm btn--primary cookie-banner__btn"
          onClick={() => handleSave("granted")}
          aria-label={c.acceptAria}
        >
          {c.accept}
        </button>
      </div>
    </div>
  );
}
