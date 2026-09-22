"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { Icon } from "@/components/ui/icons";

export function ContactForm() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          topic: String(data.get("topic") ?? "other"),
          message: String(data.get("message") ?? ""),
          consent: data.get("consent") === "on",
          locale,
        }),
      });
      if (!res.ok) throw new Error(`contact ${res.status}`);
      const json = (await res.json()) as { success?: boolean };
      if (!json.success) throw new Error("contact not stored");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="form-status form-status--ok" role="status">
        <p style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Icon name="check" size={16} /> {dict.forms.success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <div className="field">
        <label className="field__label" htmlFor="contact-name">
          {dict.forms.name}
        </label>
        <input
          id="contact-name"
          name="name"
          required
          className="input"
          placeholder={dict.forms.namePlaceholder}
          autoComplete="name"
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="contact-email">
          {dict.forms.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className="input"
          placeholder={dict.forms.emailPlaceholder}
          autoComplete="email"
        />
      </div>
      <div className="field form-grid--single">
        <label className="field__label" htmlFor="contact-topic">
          {dict.forms.topic}
        </label>
        <select id="contact-topic" name="topic" className="select" defaultValue="order">
          <option value="order">{dict.forms.topicOrder}</option>
          <option value="product">{dict.forms.topicProduct}</option>
          <option value="artisan">{dict.forms.topicArtisan}</option>
          <option value="wholesale">{dict.forms.topicWholesale}</option>
          <option value="other">{dict.forms.topicOther}</option>
        </select>
      </div>
      <div className="field form-grid--single">
        <label className="field__label" htmlFor="contact-message">
          {dict.forms.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          className="textarea"
          placeholder={dict.forms.messagePlaceholder}
        />
      </div>
      <div className="field form-grid--single">
        <label className="field__label field__label--checkbox">
          <input
            type="checkbox"
            name="consent"
            required
            className="checkbox"
            defaultChecked={false}
            aria-required="true"
          />
          <span className="field__checkbox-label">
            {dict.forms.consent}{" "}
            <Link href={`/${locale}/privacy`} className="field__link">
              {dict.forms.consentPrivacy}
            </Link>
          </span>
        </label>
        <span className="field__error" aria-live="polite">
          {dict.forms.consentRequired}
        </span>
      </div>
      <div className="form-grid--single">
        {status === "error" && (
          <p className="form-status form-status--error" role="alert" style={{ marginBottom: "0.75rem" }}>
            {dict.forms.sendError}
          </p>
        )}
        <button
          type="submit"
          className="btn btn--primary btn--lg"
          disabled={status === "sending"}
          aria-busy={status === "sending"}
        >
          {status === "sending" ? dict.forms.sending : dict.forms.send}
        </button>
      </div>
    </form>
  );
}
