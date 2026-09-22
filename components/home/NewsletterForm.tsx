"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { Icon } from "@/components/ui/icons";

export function NewsletterForm() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);

  const isValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(dict.forms.newsletterEmail);
      return;
    }
    if (!isValid(email)) {
      setError(locale === "es" ? "Email inválido" : "Invalid email");
      return;
    }
    if (!consent) {
      setError(
        locale === "es"
          ? "Debes aceptar la política de privacidad."
          : "You must accept the privacy policy.",
      );
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale }),
      });

      if (!res.ok) throw new Error("Server error");

      setStatus("sent");
    } catch {
      setStatus("error");
      setError(
        locale === "es"
          ? "Error al suscribirte. Intenta más tarde."
          : "Could not subscribe. Try again later.",
      );
    }
  };

  if (status === "sent") {
    return (
      <p className="form-status form-status--ok" role="status">
        <Icon name="check" size={15} /> {dict.forms.newsletterSuccess}
      </p>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit} aria-describedby={status === "error" ? "newsletter-error" : undefined}>
      <label className="sr-only" htmlFor="newsletter-email">
        {dict.forms.newsletterEmail}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        className="input newsletter-form__input"
        placeholder={dict.forms.newsletterEmail}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        aria-invalid={status === "error"}
        aria-describedby="newsletter-error"
      />
      <label className="field__label--checkbox newsletter-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="checkbox"
          aria-required="true"
        />
        <span className="field__checkbox-label">
          {locale === "es"
            ? "Acepto la política de privacidad y recibir emails."
            : "I accept the privacy policy and marketing emails."}{" "}
          <Link href={`/${locale}/privacy`} className="field__link">
            {locale === "es" ? "Política de privacidad" : "Privacy Policy"}
          </Link>
        </span>
      </label>
      <button type="submit" className="btn btn--light" disabled={status === "sending" || !consent}>
        {status === "sending" ? (
          <Icon name="clock" size={15} />
        ) : (
          dict.forms.subscribe
        )}
      </button>
      {status === "error" && (
        <p id="newsletter-error" className="form-status form-status--err" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
