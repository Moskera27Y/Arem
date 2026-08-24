"use client";

import { useState, type FormEvent } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { Icon } from "@/components/ui/icons";

export function NewsletterForm() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    // Phase 2: local confirmation only. An Admin connects this to a
    // newsletter provider (and the form data model) in a later phase.
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <p className="form-status form-status--ok" role="status">
        <Icon name="check" size={15} /> {dict.forms.newsletterSuccess}
      </p>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
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
      />
      <button type="submit" className="btn btn--light">
        {dict.forms.subscribe}
      </button>
    </form>
  );
}
