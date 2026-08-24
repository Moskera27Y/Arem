"use client";

/**
 * Promotion management — percentage / fixed / free-shipping / announcement.
 * Status is computed live (active, scheduled, expired, inactive). Active
 * promotions drive storefront pricing badges and the announcement bar.
 */

import { useMemo, useState } from "react";
import {
  PROMOTION_STATUS_LABELS,
  PROMOTION_TYPES,
  type Promotion,
  type PromotionType,
} from "@/lib/admin/types";
import { useAdminStore } from "@/lib/admin/store";
import { getPromotionStatus } from "@/lib/admin/promotions";
import { resolveCategories } from "@/lib/content";
import { formatMoney } from "@/lib/format";
import { BiFields, ConfirmDialog, EmptyState, Field, PageHead } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icons";

interface PromotionDraft {
  id?: string;
  name: string;
  description: string;
  type: PromotionType;
  value: string;
  startDate: string;
  endDate: string;
  active: boolean;
  productIds: string[];
  categoryIds: string[];
  announcement: { en: string; es: string };
}

const EMPTY_DRAFT: PromotionDraft = {
  name: "",
  description: "",
  type: "percentage",
  value: "10",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  active: true,
  productIds: [],
  categoryIds: [],
  announcement: { en: "", es: "" },
};

const STATUS_CHIP: Record<string, string> = {
  active: "chip--active",
  scheduled: "chip--scheduled",
  expired: "chip--expired",
  inactive: "chip--inactive",
};

export function PromotionsManager() {
  const { promotions, products, categories, upsertPromotion, deletePromotion } = useAdminStore();
  const [draft, setDraft] = useState<PromotionDraft | null>(null);
  const [errors, setErrors] = useState<{ name?: string; dates?: string }>({});
  const [toDelete, setToDelete] = useState<string | null>(null);

  const productOptions = useMemo(() => [...products].sort((a, b) => a.name.en.localeCompare(b.name.en)), [products]);
  const categoryOptions = useMemo(
    () => resolveCategories(categories, "en").sort((a, b) => a.order - b.order),
    [categories],
  );

  const sorted = useMemo(() => [...promotions].sort((a, b) => a.startDate.localeCompare(b.startDate)), [promotions]);

  const openNew = () => {
    setDraft({ ...EMPTY_DRAFT, value: "10", productIds: [], categoryIds: [] });
    setErrors({});
  };

  const openEdit = (p: Promotion) => {
    setDraft({
      id: p.id,
      name: p.name,
      description: p.description,
      type: p.type,
      value: String(p.value),
      startDate: p.startDate,
      endDate: p.endDate,
      active: p.active,
      productIds: [...p.productIds],
      categoryIds: [...p.categoryIds],
      announcement: { ...p.announcement },
    });
    setErrors({});
  };

  const save = () => {
    if (!draft) return;
    const next: typeof errors = {};
    if (!draft.name.trim()) next.name = "Name is required.";
    const start = new Date(`${draft.startDate}T00:00:00`);
    const end = new Date(`${draft.endDate}T23:59:59`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      next.dates = "Enter valid dates with the end after the start.";
    }
    if (draft.type === "percentage" && (Number(draft.value) <= 0 || Number(draft.value) > 100)) {
      next.dates = next.dates ? `${next.dates} Percentage must be between 1 and 100.` : "Percentage must be between 1 and 100.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    upsertPromotion({
      id: draft.id ?? `promo-${Date.now().toString(36)}`,
      name: draft.name.trim(),
      description: draft.description.trim(),
      type: draft.type,
      value: draft.type === "percentage" || draft.type === "fixed" ? Number(draft.value) || 0 : 0,
      startDate: draft.startDate,
      endDate: draft.endDate,
      active: draft.active,
      productIds: draft.productIds,
      categoryIds: draft.categoryIds,
      announcement: draft.announcement,
    });
    setDraft(null);
  };

  const targetSummary = (p: Promotion) => {
    if (p.productIds.length === 0 && p.categoryIds.length === 0) return "All products";
    const parts: string[] = [];
    if (p.categoryIds.length > 0) {
      const names = p.categoryIds
        .map((id) => resolveCategories(categories, "en").find((c) => c.id === id)?.name)
        .filter(Boolean);
      parts.push(`${names.length} categor${names.length === 1 ? "y" : "ies"}`);
    }
    if (p.productIds.length > 0) parts.push(`${p.productIds.length} product${p.productIds.length === 1 ? "" : "s"}`);
    return parts.join(" + ") || "—";
  };

  const typeLabel = (t: PromotionType) => PROMOTION_TYPES.find((x) => x.id === t)?.label ?? t;
  const valueLabel = (p: Promotion) =>
    p.type === "percentage" ? `${Math.round(p.value)}% off` : p.type === "fixed" ? formatMoney({ amount: p.value, currency: "COP" }) : "—";

  const toggleTarget = (list: string[], id: string, set: (v: string[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  return (
    <>
      <PageHead
        title="Promotions"
        sub="Launch discounts, free shipping and announcements. Active promotions appear on the storefront automatically."
        action={
          <button type="button" className="btn btn--primary" onClick={openNew}>
            <Icon name="plus" size={15} /> Create promotion
          </button>
        }
      />

      {draft && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="admin-card__title" style={{ marginBottom: "1.25rem" }}>
            {draft.id ? "Edit promotion" : "New promotion"}
          </h2>
          {Object.keys(errors).length > 0 && (
            <div className="admin-form__error-summary" role="alert" style={{ marginBottom: "1rem" }}>
              {errors.name ?? errors.dates}
            </div>
          )}
          <div className="admin-form">
            <div className="admin-form__grid">
              <Field label="Name" required error={errors.name}>
                <input
                  className="input"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. August coffee sale"
                />
              </Field>
              <Field label="Internal description">
                <input
                  className="input"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Notes for your team (never shown publicly)"
                />
              </Field>
            </div>

            <div className="admin-form__grid admin-form__grid--3">
              <Field label="Promotion type">
                <select
                  className="select"
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as PromotionType })}
                >
                  {PROMOTION_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={draft.type === "percentage" ? "Value (%)" : draft.type === "fixed" ? "Value (COP)" : "Value"}
                hint={draft.type === "percentage" ? "1–100" : draft.type === "fixed" ? "Amount subtracted from the price" : "Not used for this type"}
              >
                <input
                  className="input"
                  type="number"
                  min="0"
                  disabled={draft.type === "free-shipping" || draft.type === "announcement"}
                  value={draft.value}
                  onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                />
              </Field>
              <Field label="Active">
                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", paddingTop: "0.35rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-2)" }}>
                    Launch immediately (respects dates)
                  </span>
                </label>
              </Field>
              <Field label="Start date" required>
                <input
                  className="input"
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                />
              </Field>
              <Field label="End date" required>
                <input
                  className="input"
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                />
              </Field>
            </div>

            <div className="admin-form__grid">
              <Field label="Applicable products" hint="Leave empty to apply to all (see categories).">
                <div
                  style={{
                    maxHeight: "12rem",
                    overflowY: "auto",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-md)",
                    padding: "0.5rem",
                    background: "var(--white)",
                  }}
                >
                  {productOptions.length === 0 && <p className="muted" style={{ fontSize: "var(--text-xs)", padding: "0.5rem" }}>No products yet.</p>}
                  {productOptions.map((p) => (
                    <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.4rem", fontSize: "var(--text-sm)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={draft.productIds.includes(p.id)}
                        onChange={() => toggleTarget(draft.productIds, p.id, (v) => setDraft({ ...draft, productIds: v }))}
                      />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name.en}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Applicable categories" hint="Leave empty to apply to all products.">
                <div
                  style={{
                    maxHeight: "12rem",
                    overflowY: "auto",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-md)",
                    padding: "0.5rem",
                    background: "var(--white)",
                  }}
                >
                  {categoryOptions.length === 0 && <p className="muted" style={{ fontSize: "var(--text-xs)", padding: "0.5rem" }}>No categories yet.</p>}
                  {categoryOptions.map((c) => (
                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.4rem", fontSize: "var(--text-sm)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={draft.categoryIds.includes(c.id)}
                        onChange={() => toggleTarget(draft.categoryIds, c.id, (v) => setDraft({ ...draft, categoryIds: v }))}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", marginBottom: "0.9rem" }}>
                Public announcement text
              </h3>
              <BiFields
                enLabel="Announcement (English)"
                esLabel="Announcement (Spanish)"
                en={draft.announcement.en}
                es={draft.announcement.es}
                onEn={(v) => setDraft({ ...draft, announcement: { ...draft.announcement, en: v } })}
                onEs={(v) => setDraft({ ...draft, announcement: { ...draft.announcement, es: v } })}
                placeholder="Shown in the storefront announcement bar (optional)"
              />
            </div>

            <div className="admin-form__actions">
              <button type="button" className="btn btn--primary" onClick={save}>
                <Icon name="check" size={15} /> Save promotion
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setDraft(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            icon="percent"
            title="No promotions yet"
            text="Create a discount, a free-shipping offer or an announcement."
            action={
              <button type="button" className="btn btn--primary btn--sm" onClick={openNew}>
                Create promotion
              </button>
            }
          />
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Promotion</th>
                <th>Type</th>
                <th>Value</th>
                <th>Dates</th>
                <th>Targets</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((promotion) => {
                const status = getPromotionStatus(promotion);
                return (
                  <tr key={promotion.id}>
                    <td data-label="Promotion">
                      <div className="data-table__name">{promotion.name}</div>
                      {promotion.description && <div className="data-table__sub">{promotion.description}</div>}
                    </td>
                    <td data-label="Type">{typeLabel(promotion.type)}</td>
                    <td data-label="Value">{valueLabel(promotion)}</td>
                    <td data-label="Dates" className="data-table__sub">
                      {promotion.startDate} → {promotion.endDate}
                    </td>
                    <td data-label="Targets" className="data-table__sub">
                      {targetSummary(promotion)}
                    </td>
                    <td data-label="Status">
                      <span className={`chip ${STATUS_CHIP[status]}`}>{PROMOTION_STATUS_LABELS[status]}</span>
                    </td>
                    <td data-label="Actions">
                      <div className="data-table__actions" style={{ justifyContent: "flex-end" }}>
                        <button type="button" className="icon-action" aria-label={`Edit ${promotion.name}`} onClick={() => openEdit(promotion)}>
                          <Icon name="pencil" size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-action icon-action--danger"
                          aria-label={`Delete ${promotion.name}`}
                          onClick={() => setToDelete(promotion.id)}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this promotion?"
        text="The promotion will stop affecting the storefront immediately. This cannot be undone."
        onConfirm={() => {
          if (toDelete) deletePromotion(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
