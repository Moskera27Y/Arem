"use client";

/**
 * Reusable Admin UI primitives — forms, confirmation, empty states.
 * Labels are English (Admin interface); content fields are bilingual.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icons";

/* ------------------------------ Field ------------------------------ */

export function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={`field${error ? " field--invalid" : ""}`}>
      {label && (
        <span className="field__label">
          {label}
          {required && <span style={{ color: "var(--clay)" }}> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="input-hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

/* --------------------------- Bilingual field ----------------------- */

export function BiFields({
  enLabel,
  esLabel,
  en,
  es,
  onEn,
  onEs,
  type = "text",
  required,
  textarea,
  errorEn,
  errorEs,
  placeholder,
  hint,
}: {
  enLabel: string;
  esLabel: string;
  en: string;
  es: string;
  onEn: (value: string) => void;
  onEs: (value: string) => void;
  type?: "text" | "textarea";
  required?: boolean;
  textarea?: boolean;
  errorEn?: string;
  errorEs?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="admin-form__grid">
      <Field label={enLabel} required={required} error={errorEn} hint={hint}>
        {textarea || type === "textarea" ? (
          <textarea className="textarea" value={en} onChange={(e) => onEn(e.target.value)} placeholder={placeholder} />
        ) : (
          <input className="input" type="text" value={en} onChange={(e) => onEn(e.target.value)} placeholder={placeholder} />
        )}
      </Field>
      <Field label={esLabel} required={required} error={errorEs}>
        {textarea || type === "textarea" ? (
          <textarea className="textarea" value={es} onChange={(e) => onEs(e.target.value)} placeholder={placeholder} />
        ) : (
          <input className="input" type="text" value={es} onChange={(e) => onEs(e.target.value)} placeholder={placeholder} />
        )}
      </Field>
    </div>
  );
}

/* ----------------------------- Tag input ---------------------------- */

export function TagInput({
  values,
  onChange,
  placeholder,
  ariaLabel,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setDraft("");
  };

  return (
    <div className="tag-input">
      {values.map((value) => (
        <span key={value} className="tag">
          {value}
          <button
            type="button"
            className="tag__remove"
            aria-label={`Remove ${value}`}
            onClick={() => onChange(values.filter((v) => v !== value))}
          >
            <Icon name="close" size={11} />
          </button>
        </span>
      ))}
      <input
        className="tag-input__field"
        value={draft}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}

/* --------------------------- Confirmation --------------------------- */

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <div className="admin-confirm" data-open={open} role="dialog" aria-modal="true" aria-label={title}>
      <div className="admin-confirm__panel">
        <h2 className="admin-confirm__title">{title}</h2>
        <p className="admin-confirm__text">{text}</p>
        <div className="admin-confirm__actions">
          <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger btn--sm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Empty state --------------------------- */

export function EmptyState({
  icon = "grid",
  title,
  text,
  action,
}: {
  icon?: IconName;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <span className="admin-empty__icon">
        <Icon name={icon} size={22} />
      </span>
      <strong style={{ color: "var(--ink)" }}>{title}</strong>
      <p style={{ maxWidth: "24rem" }}>{text}</p>
      {action}
    </div>
  );
}

/* ----------------------------- Page head ---------------------------- */

export function PageHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.7rem", fontWeight: 450 }}>{title}</h1>
          {sub && <p className="admin-card__sub" style={{ marginTop: "0.35rem" }}>{sub}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

/* ------------------------------ Stats ------------------------------- */

export function StatCard({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className={`admin-stat${accent ? " admin-stat--accent" : ""}`}>
      <span className="admin-stat__value">{value}</span>
      <span className="admin-stat__label">{label}</span>
    </div>
  );
}
