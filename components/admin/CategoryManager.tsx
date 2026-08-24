"use client";

/**
 * Category management — create, edit, delete, order and enable/disable.
 * Bilingual names and descriptions; changes flow straight into the
 * centralized store, which drives the storefront category sections.
 */

import { useMemo, useState } from "react";
import type { AdminCategory } from "@/lib/admin/types";
import { useAdminStore } from "@/lib/admin/store";
import { slugify } from "@/components/admin/ProductForm";
import { BiFields, ConfirmDialog, EmptyState, Field, PageHead } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icons";

interface CategoryDraft {
  id?: string;
  slug?: string;
  name: { en: string; es: string };
  shortName: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  order: number;
  enabled: boolean;
}

const EMPTY_DRAFT: CategoryDraft = {
  name: { en: "", es: "" },
  shortName: { en: "", es: "" },
  description: { en: "", es: "" },
  image: "/images/cat-textiles.svg",
  order: 10,
  enabled: true,
};

export function CategoryManager() {
  const { categories, upsertCategory, deleteCategory } = useAdminStore();
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [errors, setErrors] = useState<{ nameEn?: string; nameEs?: string }>({});
  const [toDelete, setToDelete] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  const openNew = () => {
    setDraft({ ...EMPTY_DRAFT, order: categories.length + 1 });
    setErrors({});
  };

  const openEdit = (category: AdminCategory) => {
    setDraft({
      id: category.id,
      slug: category.slug,
      name: { ...category.name },
      shortName: { ...category.shortName },
      description: { ...category.description },
      image: category.image.src,
      order: category.order,
      enabled: category.enabled !== false,
    });
    setErrors({});
  };

  const save = () => {
    if (!draft) return;
    const next: typeof errors = {};
    if (!draft.name.en.trim()) next.nameEn = "English name is required.";
    if (!draft.name.es.trim()) next.nameEs = "Spanish name is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const id = draft.id ?? `cat-${Date.now().toString(36)}`;
    const baseSlug = draft.slug ?? slugify(draft.name.en);
    let slug = baseSlug;
    let n = 2;
    while (categories.some((c) => c.slug === slug && c.id !== id)) {
      slug = `${baseSlug}-${n++}`;
    }

    upsertCategory({
      id,
      slug,
      name: draft.name,
      shortName: { en: draft.shortName.en.trim() || draft.name.en.trim(), es: draft.shortName.es.trim() || draft.name.es.trim() },
      description: draft.description,
      image: { src: draft.image.trim() || "/images/cat-textiles.svg", alt: draft.name },
      order: draft.order || 10,
      featured: undefined,
      enabled: draft.enabled,
    });
    setDraft(null);
  };

  return (
    <>
      <PageHead
        title="Categories"
        sub="Organize the catalog. Changes appear in the storefront category sections immediately."
        action={
          <button type="button" className="btn btn--primary" onClick={openNew}>
            <Icon name="plus" size={15} /> Add category
          </button>
        }
      />

      {draft && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="admin-card__title" style={{ marginBottom: "1.25rem" }}>
            {draft.id ? "Edit category" : "New category"}
          </h2>
          <div className="admin-form">
            <BiFields
              enLabel="Name (English)"
              esLabel="Name (Spanish)"
              en={draft.name.en}
              es={draft.name.es}
              onEn={(v) => setDraft({ ...draft, name: { ...draft.name, en: v } })}
              onEs={(v) => setDraft({ ...draft, name: { ...draft.name, es: v } })}
              required
              errorEn={errors.nameEn}
              errorEs={errors.nameEs}
              placeholder="e.g. Textiles"
            />
            <div style={{ height: "1rem" }} />
            <BiFields
              enLabel="Short name (English)"
              esLabel="Short name (Spanish)"
              en={draft.shortName.en}
              es={draft.shortName.es}
              onEn={(v) => setDraft({ ...draft, shortName: { ...draft.shortName, en: v } })}
              onEs={(v) => setDraft({ ...draft, shortName: { ...draft.shortName, es: v } })}
              hint="Used in product cards and filters. Falls back to the name."
            />
            <div style={{ height: "1rem" }} />
            <BiFields
              enLabel="Description (English)"
              esLabel="Description (Spanish)"
              en={draft.description.en}
              es={draft.description.es}
              onEn={(v) => setDraft({ ...draft, description: { ...draft.description, en: v } })}
              onEs={(v) => setDraft({ ...draft, description: { ...draft.description, es: v } })}
              textarea
            />
            <div className="admin-form__grid admin-form__grid--3">
              <Field label="Image URL / placeholder">
                <datalist id="arem-cat-placeholders">
                  {["/images/cat-coffee.svg", "/images/cat-textiles.svg", "/images/cat-ceramics.svg", "/images/cat-bags.svg", "/images/cat-jewelry.svg", "/images/cat-home.svg"].map((src) => (
                    <option key={src} value={src} />
                  ))}
                </datalist>
                <input
                  className="input"
                  list="arem-cat-placeholders"
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                />
              </Field>
              <Field label="Display order">
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  value={draft.order}
                  onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Enabled">
                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", paddingTop: "0.35rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                  />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-2)" }}>
                    Visible in the storefront
                  </span>
                </label>
              </Field>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="btn btn--primary" onClick={save}>
                <Icon name="check" size={15} /> Save category
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
            icon="tag"
            title="No categories yet"
            text="Create a category to start organizing products."
            action={
              <button type="button" className="btn btn--primary btn--sm" onClick={openNew}>
                Add category
              </button>
            }
          />
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Category</th>
                <th>Enabled</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((category) => (
                <tr key={category.id}>
                  <td data-label="Order">{category.order}</td>
                  <td data-label="Category">
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="data-table__thumb" style={{ width: "2.75rem", height: "2.75rem" }} src={category.image.src} alt="" />
                      <div>
                        <div className="data-table__name">{category.name.en}</div>
                        <div className="data-table__sub">{category.name.es}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Enabled">
                    <span className={`chip chip--${category.enabled !== false ? "published" : "inactive"}`}>
                      {category.enabled !== false ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="data-table__actions" style={{ justifyContent: "flex-end" }}>
                      <button type="button" className="icon-action" aria-label={`Edit ${category.name.en}`} onClick={() => openEdit(category)}>
                        <Icon name="pencil" size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-action icon-action--danger"
                        aria-label={`Delete ${category.name.en}`}
                        onClick={() => setToDelete(category.id)}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this category?"
        text={
          toDelete
            ? `“${categories.find((c) => c.id === toDelete)?.name.en ?? ""}” will be removed from the storefront. Products keep their data but lose this category.`
            : ""
        }
        onConfirm={() => {
          if (toDelete) deleteCategory(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
