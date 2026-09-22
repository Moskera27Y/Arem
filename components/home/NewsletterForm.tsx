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
      setError(dict.forms.invalidEmail);
      return;
    }
    if (!consent) {
      setError(dict.forms.newsletterConsentRequired);
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
      setError(dict.forms.subscribeError);
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
          {dict.forms.newsletterConsent}{" "}
          <Link href={`/${locale}/privacy`} className="field__link">
            {dict.forms.consentPrivacy}
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
