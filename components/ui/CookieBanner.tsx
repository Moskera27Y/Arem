"use client";

import { useEffect, useState } from "react";
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

  const text =
    locale === "es"
      ? "Usamos cookies esenciales para que el sitio funcione y cookies analíticas opcionales para mejorar tu experiencia. "
      : "We use essential cookies to make the site work and optional analytics cookies to improve your experience. ";

  return (
    <div
      className={`cookie-banner ${reduceMotion ? "" : "cookie-banner--enter"}`}
      role="dialog"
      aria-live="polite"
      aria-label={locale === "es" ? "Preferencias de cookies" : "Cookie preferences"}
    >
      <div className="cookie-banner__text">
        {text}
        <Link href={`/${locale}/cookies`} className="cookie-banner__link">
          {locale === "es" ? "Política de cookies" : "Cookie policy"}
        </Link>
      </div>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="btn btn--sm btn--ghost cookie-banner__btn"
          onClick={() => handleSave("partial")}
          aria-label={locale === "es" ? "Rechazar cookies no esenciales" : "Reject non-essential cookies"}
        >
          {locale === "es" ? "Rechazar" : "Reject"}
        </button>
        <button
          type="button"
          className="btn btn--sm btn--primary cookie-banner__btn"
          onClick={() => handleSave("granted")}
          aria-label={locale === "es" ? "Aceptar todas las cookies" : "Accept all cookies"}
        >
          {locale === "es" ? "Aceptar todo" : "Accept all"}
        </button>
      </div>
    </div>
  );
}
