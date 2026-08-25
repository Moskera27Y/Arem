"use client";

/**
 * Product create/edit form.
 * Fields are bilingual for everything customer-facing (EN default / ES).
 * Simple single-SKU model: colors × sizes are expanded into options and
 * variants (each with the same price/SKU base) — documented prototype
 * simplification of the storefront's variant engine.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getArtisans,
  getCollections,
  getRegions,
} from "@/lib/content";
import type { Localized } from "@/lib/content/localized";
import type { AdminProduct } from "@/lib/admin/types";
import { useAdminStore } from "@/lib/admin/store";
import { BiFields, ConfirmDialog, Field, PageHead, TagInput } from "@/components/admin/ui";
import { CollectionPicker } from "@/components/admin/CollectionPicker";
import { Icon } from "@/components/ui/icons";

const PLACEHOLDER_IMAGES = [
  "/images/cat-coffee.svg",
  "/images/cat-textiles.svg",
  "/images/cat-ceramics.svg",
  "/images/cat-bags.svg",
  "/images/cat-jewelry.svg",
  "/images/cat-home.svg",
  "/images/r-andes.svg",
  "/images/r-guajira.svg",
  "/images/r-caribe.svg",
  "/images/r-bogota.svg",
  "/images/s-cafe.svg",
  "/images/s-tejer.svg",
  "/images/s-barro.svg",
  "/images/s-esmeralda.svg",
  "/images/s-hamaca.svg",
  "/images/hero-craft.svg",
];

interface FormValues {
  name: { en: string; es: string };
  tagline: { en: string; es: string };
  description: { en: string; es: string };
  story: { en: string; es: string };
  categoryId: string;
  collectionId: string;
  regionId: string;
  artisanId: string;
  price: string;
  salePrice: string;
  sku: string;
  inventory: string;
  status: "draft" | "published";
  featured: boolean;
  images: string[];
  colors: string[];
  sizes: string[];
}

interface Errors {
  nameEn?: string;
  nameEs?: string;
  price?: string;
  sku?: string;
  inventory?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "product";
}

function fromSeed(seed: AdminProduct | undefined): FormValues {
  if (!seed) {
    return {
      name: { en: "", es: "" },
      tagline: { en: "", es: "" },
      description: { en: "", es: "" },
      story: { en: "", es: "" },
      categoryId: "",
      collectionId: "",
      regionId: "",
      artisanId: "",
      price: "",
      salePrice: "",
      sku: "",
      inventory: "0",
      status: "draft",
      featured: false,
      images: ["/images/cat-textiles.svg", "/images/cat-textiles.svg"],
      colors: [],
      sizes: [],
    };
  }
  const first = seed.variants[0];
  return {
    name: { ...seed.name },
    tagline: { ...seed.tagline },
    description: { ...seed.description },
    story: { en: seed.story[0]?.en ?? "", es: seed.story[0]?.es ?? "" },
    categoryId: seed.categoryIds[0] ?? "",
    collectionId: seed.collectionIds[0] ?? "",
    regionId: seed.regionId ?? "",
    artisanId: seed.artisanId ?? "",
    price: first ? String(first.price) : "",
    salePrice: first?.compareAt ? String(first.compareAt) : "",
    sku: first?.sku ?? "",
    inventory: first ? String(first.inventory) : "0",
    status: seed.status === "active" ? "published" : "draft",
    featured: seed.featured ?? false,
    images: seed.images.map((img) => img.src),
    colors: seed.options.find((o) => o.id === "color")?.values.map((v) => v.en) ?? [],
    sizes: seed.options.find((o) => o.id === "size")?.values.map((v) => v.en) ?? [],
  };
}

function buildSeed(values: FormValues, existing: AdminProduct | undefined): AdminProduct {
  const id = existing?.id ?? `pr-${Date.now().toString(36)}`;
  const slug = existing?.slug && existing.slug !== slugify(values.name.en)
    ? slugify(values.name.en)
    : (existing?.slug ?? slugify(values.name.en));
  const price = Math.max(0, Number(values.price) || 0);
  const sale = values.salePrice.trim() !== "" ? Math.max(0, Number(values.salePrice) || 0) : undefined;
  const inventory = Math.max(0, Number(values.inventory) || 0);
  const sku = values.sku.trim() || `SKU-${id.toUpperCase()}`;
  const colors = values.colors;
  const sizes = values.sizes;

  const L = (en: string, es: string): Localized => ({ en, es });
  const name = { en: values.name.en.trim(), es: values.name.es.trim() };

  // Build options + variants from colors × sizes (uniform price/SKU base).
  const options: AdminProduct["options"] = [];
  const variants: AdminProduct["variants"] = [];
  if (colors.length > 0) options.push({ id: "color", name: L("Color", "Color"), values: colors.map((c) => L(c, c)) });
  if (sizes.length > 0) options.push({ id: "size", name: L("Size", "Talla"), values: sizes.map((s) => L(s, s)) });

  if (options.length === 0) {
    variants.push({
      id: `${id}-v0`,
      sku,
      title: name,
      values: {},
      price,
      compareAt: sale,
      inventory,
    });
  } else {
    let index = 0;
    for (const color of colors.length > 0 ? colors : [""]) {
      for (const size of sizes.length > 0 ? sizes : [""]) {
        const label = [color, size].filter(Boolean).join(" · ") || name.en;
        const values: Record<string, Localized> = {};
        if (colors.length > 0) values.color = L(color, color);
        if (sizes.length > 0) values.size = L(size, size);
        index += 1;
        variants.push({
          id: `${id}-v${index}`,
          sku: `${sku}-${index}`,
          title: L(label, label),
          values,
          price,
          compareAt: sale,
          inventory,
        });
      }
    }
  }

  const percent = sale !== undefined && sale < price ? Math.round(((price - sale) / price) * 100) : null;
  const badge: Localized | undefined =
    percent !== null ? { en: `-${percent}%`, es: `-${percent}%` } : undefined;

  return {
    id,
    slug,
    name,
    tagline: { en: values.tagline.en.trim(), es: values.tagline.es.trim() },
    description: { en: values.description.en.trim(), es: values.description.es.trim() },
    story: [
      { en: values.story.en.trim(), es: values.story.es.trim() },
      ...(existing?.story.slice(1) ?? []),
    ],
    details: existing?.details ?? [],
    images: values.images.filter((src) => src.trim()).map((src) => ({
      src: src.trim(),
      alt: name,
    })),
    price: { amount: price, currency: "USD" },
    compareAtPrice: sale !== undefined ? { amount: sale, currency: "USD" } : undefined,
    options,
    variants,
    categoryIds: values.categoryId ? [values.categoryId] : [],
    collectionIds: values.collectionId ? [values.collectionId] : [],
    regionId: values.regionId || undefined,
    artisanId: values.artisanId || undefined,
    featured: values.featured,
    badge,
    status: values.status === "published" ? "active" : "draft",
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
  };
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { products, categories, upsertProduct, deleteProduct } = useAdminStore();
  const existing = useMemo(
    () => (productId ? products.find((p) => p.id === productId) : undefined),
    [products, productId],
  );
  const [values, setValues] = useState<FormValues>(() => fromSeed(existing));
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(existing?.id ?? null);

  // The Admin store hydrates from localStorage after mount; once the record
  // becomes available, load it into the form (and when switching records).
  useEffect(() => {
    if (existing && existing.id !== loadedFor) {
      setValues(fromSeed(existing));
      setLoadedFor(existing.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, loadedFor]);

  const collectionOptions = useMemo(() => getCollections("en"), []);
  const regionOptions = useMemo(() => getRegions("en"), []);
  const artisanOptions = useMemo(() => getArtisans("en"), []);
  const categoryOptions = useMemo(
    () => categories.filter((c) => c.enabled !== false).map((c) => ({ id: c.id, name: c.name.en })),
    [categories],
  );

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.name.en.trim()) next.nameEn = "English name is required.";
    if (!values.name.es.trim()) next.nameEs = "Spanish name is required.";
    const price = Number(values.price);
    if (!values.price.trim() || Number.isNaN(price) || price <= 0) next.price = "Enter a valid price greater than 0.";
    if (!values.sku.trim()) next.sku = "SKU is required.";
    const inventory = Number(values.inventory);
    if (values.inventory.trim() === "" || Number.isNaN(inventory) || inventory < 0) {
      next.inventory = "Inventory must be 0 or greater.";
    }
    return next;
  };

  const handleSave = () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    upsertProduct(buildSeed(values, existing));
    router.push("/admin/products");
  };

  const handleDelete = () => {
    if (!existing) return;
    deleteProduct(existing.id);
    router.push("/admin/products");
  };

  return (
    <>
      <PageHead
        title={existing ? `Edit · ${existing.name.en}` : "New product"}
        sub="All customer-facing fields support English and Spanish."
        action={
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => router.push("/admin/products")}>
            Cancel
          </button>
        }
      />

      {Object.keys(errors).length > 0 && (
        <div className="admin-form__error-summary" role="alert">
          Please fix the highlighted fields before saving.
        </div>
      )}

      <div className="admin-form">
        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Basics</h2>
          <BiFields
            enLabel="Name (English)"
            esLabel="Name (Spanish)"
            en={values.name.en}
            es={values.name.es}
            onEn={(v) => set("name", { ...values.name, en: v })}
            onEs={(v) => set("name", { ...values.name, es: v })}
            required
            errorEn={errors.nameEn}
            errorEs={errors.nameEs}
            placeholder="e.g. Wayuu Mochila"
          />
          <div style={{ height: "1rem" }} />
          <BiFields
            enLabel="Tagline (English)"
            esLabel="Tagline (Spanish)"
            en={values.tagline.en}
            es={values.tagline.es}
            onEn={(v) => set("tagline", { ...values.tagline, en: v })}
            onEs={(v) => set("tagline", { ...values.tagline, es: v })}
            placeholder="e.g. Woven by hand in La Guajira"
          />
          <div style={{ height: "1rem" }} />
          <BiFields
            enLabel="Short description (English)"
            esLabel="Short description (Spanish)"
            en={values.description.en}
            es={values.description.es}
            onEn={(v) => set("description", { ...values.description, en: v })}
            onEs={(v) => set("description", { ...values.description, es: v })}
            textarea
            placeholder="One or two sentences shown in the product card."
          />
          <div style={{ height: "1rem" }} />
          <BiFields
            enLabel="Product story (English)"
            esLabel="Product story (Spanish)"
            en={values.story.en}
            es={values.story.es}
            onEn={(v) => set("story", { ...values.story, en: v })}
            onEs={(v) => set("story", { ...values.story, es: v })}
            textarea
            placeholder="The story of this piece, shown on the product page."
          />
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Classification</h2>
          <div className="admin-form__grid admin-form__grid--3">
            <Field label="Category">
              <select
                className="select"
                value={values.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">— None —</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Collection">
              <select
                className="select"
                value={values.collectionId}
                onChange={(e) => set("collectionId", e.target.value)}
              >
                <option value="">— None —</option>
                {collectionOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Collections (multiple)">
              <CollectionPicker productId={productId} />
            </Field>
            <Field label="Region">
              <select
                className="select"
                value={values.regionId}
                onChange={(e) => set("regionId", e.target.value)}
              >
                <option value="">— None —</option>
                {regionOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Artisan / producer">
              <select
                className="select"
                value={values.artisanId}
                onChange={(e) => set("artisanId", e.target.value)}
              >
                <option value="">— None —</option>
                {artisanOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Pricing & inventory</h2>
          <div className="admin-form__grid admin-form__grid--3">
            <Field label="Price (USD)" required error={errors.price}>
              <input
                className="input"
                type="number"
                min="0"
                step="1000"
                value={values.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="320000"
              />
            </Field>
            <Field label="Sale price (USD)" hint="Optional. Shown as the original price.">
              <input
                className="input"
                type="number"
                min="0"
                step="1000"
                value={values.salePrice}
                onChange={(e) => set("salePrice", e.target.value)}
                placeholder="380000"
              />
            </Field>
            <Field label="SKU" required error={errors.sku}>
              <input
                className="input"
                type="text"
                value={values.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="MCH-KAT-001"
              />
            </Field>
            <Field label="Inventory quantity" required error={errors.inventory}>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                value={values.inventory}
                onChange={(e) => set("inventory", e.target.value)}
              />
            </Field>
            <Field label="Status">
              <select
                className="select"
                value={values.status}
                onChange={(e) => set("status", e.target.value as FormValues["status"])}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="Featured product">
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", paddingTop: "0.35rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={values.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-2)" }}>Show in featured sections</span>
              </label>
            </Field>
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Colors & sizes</h2>
          <div className="admin-form__grid">
            <Field label="Available colors" hint="Type a color and press Enter.">
              <TagInput
                values={values.colors}
                onChange={(v) => set("colors", v)}
                placeholder="e.g. Cacao"
                ariaLabel="Available colors"
              />
            </Field>
            <Field label="Available sizes" hint="Type a size and press Enter.">
              <TagInput
                values={values.sizes}
                onChange={(v) => set("sizes", v)}
                placeholder="e.g. S, M, L"
                ariaLabel="Available sizes"
              />
            </Field>
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Images</h2>
          <Field hint="Use a placeholder path from the list or any image URL.">
            <datalist id="arem-placeholders">
              {PLACEHOLDER_IMAGES.map((src) => (
                <option key={src} value={src} />
              ))}
            </datalist>
          </Field>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {values.images.map((src, index) => (
              <div className="image-slot" key={index}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="image-slot__preview" src={src || "/images/cat-textiles.svg"} alt="" />
                <div className="image-slot__fields">
                  <input
                    className="input"
                    list="arem-placeholders"
                    value={src}
                    onChange={(e) => {
                      const next = [...values.images];
                      next[index] = e.target.value;
                      set("images", next);
                    }}
                    placeholder="/images/… or https://…"
                  />
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => set("images", values.images.filter((_, i) => i !== index))}
                  >
                    <Icon name="trash" size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              style={{ alignSelf: "flex-start" }}
              onClick={() => set("images", [...values.images, ""])}
            >
              <Icon name="image" size={14} /> Add image
            </button>
          </div>
        </section>

        <div className="admin-form__actions">
          <button type="button" className="btn btn--primary" onClick={handleSave}>
            <Icon name="check" size={15} /> Save product
          </button>
          {existing && (
            <button type="button" className="btn btn--ghost-danger" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this product?"
        text={`“${existing?.name.en ?? ""}” will be removed from the storefront and the Admin catalog. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
