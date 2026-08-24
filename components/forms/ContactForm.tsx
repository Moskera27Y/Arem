"use client";

import { useState, type FormEvent } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { Icon } from "@/components/ui/icons";

export function ContactForm() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Phase 2: local confirmation only. A later phase connects this form to
    // the Admin/backend (or a mail provider) and adds validation.
    setStatus("sent");
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
      <div className="form-grid--single">
        <button type="submit" className="btn btn--primary btn--lg">
          {dict.forms.send}
        </button>
      </div>
    </form>
  );
}
