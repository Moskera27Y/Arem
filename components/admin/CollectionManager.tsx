"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/format";
import { useAdminStore } from "@/lib/admin/store";
import { Icon } from "@/components/ui/icons";
import { ConfirmDialog, EmptyState, Field, PageHead } from "@/components/admin/ui";

type ColRow = {
  id: string; name_en: string; name_es: string; slug: string;
  description_en: string | null; description_es: string | null;
  image_key: string | null; image_url: string | null; image_alt_en: string | null; image_alt_es: string | null;
  is_active: boolean; sort_order: number; product_count?: number;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function CollectionManager() {
  const [rows, setRows] = useState<ColRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ColRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean | number | null>>({});
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const load = async () => {
    const r = await fetch("/api/admin/collections");
    if (r.ok) setRows(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string | number | boolean | null) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setCreating(true);
    setForm({ name_en: "", name_es: "", slug: "", description_en: "", description_es: "", image_url: null, image_key: null, image_alt_en: "", image_alt_es: "", is_active: true, sort_order: rows.length + 1 });
    setSelected([]); setStatus(null); setProductSearch("");
  };
  const openEdit = async (row: ColRow) => {
    setEditing(row);
    setCreating(true);
    setForm({ id: row.id, name_en: row.name_en, name_es: row.name_es, slug: row.slug, description_en: row.description_en ?? "", description_es: row.description_es ?? "", image_url: row.image_url, image_key: row.image_key, image_alt_en: row.image_alt_en ?? "", image_alt_es: row.image_alt_es ?? "", is_active: row.is_active, sort_order: row.sort_order });
    const pr = await fetch(`/api/admin/collections/${row.id}/products`).then((r) => (r.ok ? r.json() : { product_ids: [] }));
    setSelected(pr.product_ids ?? []);
    setStatus(null); setProductSearch("");
  };
  const close = () => { setCreating(false); setEditing(null); setSelected([]); };

  async function uploadImage(file: File) {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (r.ok) { const d = await r.json(); set("image_url", d.url); set("image_key", d.pathname); }
    else setStatus({ ok: false, msg: "No se pudo subir la imagen." });
  }

  async function save() {
    const name_en = String(form.name_en || "").trim();
    const slug = String(form.slug || "").trim();
    if (!name_en || !slug) { setStatus({ ok: false, msg: "Nombre y slug son requeridos." }); return; }
    const body = { ...form, id: editing?.id, name_en, slug, sort_order: Number(form.sort_order) || 0 };
    const r = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) {
      const saved = await r.json();
      await fetch(`/api/admin/collections/${saved.id}/products`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_ids: selected }) });
      setStatus({ ok: true, msg: "Colección guardada." });
      close(); await load();
    } else { const d = await r.json().catch(() => ({})); setStatus({ ok: false, msg: d.error || "Error" }); }
  }

  async function doDelete(id: string) {
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    setToDelete(null); await load();
  }

  // products catalog (from admin store) for the association panel
  const { products } = useAdminStore();
  const allProducts = useMemo(() => products, [products]);
  const filtered = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return q ? allProducts.filter((p) => (p.name.en + " " + p.id).toLowerCase().includes(q)) : allProducts;
  }, [allProducts, productSearch]);
  const toggleProduct = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div>
      <PageHead title="Collections" sub="Agrupa productos en colecciones (N:M con productos)." action={<button type="button" className="btn btn--primary" onClick={openNew}><Icon name="plus" size={15} /> New collection</button>} />
      {status && <div className={`form-status ${status.ok ? "form-status--ok" : "admin-form__error-summary"}`} role="status">{status.msg}</div>}

      {creating && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="admin-card__title" style={{ marginBottom: "1.25rem" }}>{editing ? "Edit collection" : "New collection"}</h2>
          <div className="admin-form">
            <div className="admin-form__grid admin-form__grid--2">
              <Field label="Name (EN)" required><input className="input" value={String(form.name_en ?? "")} onChange={(e) => { set("name_en", e.target.value); if (!editing) set("slug", slugify(e.target.value)); }} /></Field>
              <Field label="Name (ES)"><input className="input" value={String(form.name_es ?? "")} onChange={(e) => set("name_es", e.target.value)} /></Field>
              <Field label="Slug" hint="Se genera desde el nombre; puedes editarlo." ><input className="input" value={String(form.slug ?? "")} onChange={(e) => set("slug", slugify(e.target.value))} /></Field>
              <Field label="Sort order"><input className="input" type="number" min={0} value={String(form.sort_order ?? 0)} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
            </div>
            <div className="admin-form__grid admin-form__grid--2">
              <Field label="Description (EN)"><textarea className="input" rows={3} value={String(form.description_en ?? "")} onChange={(e) => set("description_en", e.target.value)} /></Field>
              <Field label="Description (ES)"><textarea className="input" rows={3} value={String(form.description_es ?? "")} onChange={(e) => set("description_es", e.target.value)} /></Field>
            </div>
            <div className="admin-form__grid admin-form__grid--3">
              <Field label="Cover image"><input type="file" accept="image/*" className="input" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} /></Field>
              <Field label="Alt (EN)"><input className="input" value={String(form.image_alt_en ?? "")} onChange={(e) => set("image_alt_en", e.target.value)} /></Field>
              <Field label="Alt (ES)"><input className="input" value={String(form.image_alt_es ?? "")} onChange={(e) => set("image_alt_es", e.target.value)} /></Field>
            </div>
            {form.image_url && <img src={String(form.image_url)} alt="" style={{ width: 160, height: 100, objectFit: "cover", borderRadius: 8, marginTop: "0.5rem" }} />}
            <label className="acc-check"><input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => set("is_active", e.target.checked)} /> Active (shown publicly)</label>

            <h3 className="admin-form__section-title" style={{ marginTop: "1.25rem" }}>Products of this collection</h3>
            <input className="input" placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} style={{ marginBottom: "0.75rem" }} />
            <div className="media-grid" style={{ maxHeight: 300, overflow: "auto" }}>
              {filtered.map((p) => {
                const checked = selected.includes(p.id);
                return (
                  <button key={p.id} type="button" className="media-card" data-active={checked} onClick={() => toggleProduct(p.id)} style={{ borderColor: checked ? "var(--brand)" : undefined }}>
                    <span className="media-card__preview"><img src={p.images?.[0]?.src ?? ""} alt="" /></span>
                    <span className="media-card__name">{p.name.en}</span>
                    <span className="media-card__meta">{formatMoney(p.price)}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="muted">No products found.</p>}
            </div>

            <div className="admin-form__actions">
              <button type="button" className="btn btn--primary" onClick={save}><Icon name="check" size={15} /> Save collection</button>
              <button type="button" className="btn btn--secondary" onClick={close}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p className="muted">Loading…</p> : rows.length === 0 ? (
        <div className="admin-card"><EmptyState icon="grid" title="No collections yet" text="Crea la primera colección." action={<button type="button" className="btn btn--primary btn--sm" onClick={openNew}>New collection</button>} /></div>
      ) : (
        <div className="admin-card" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Name</th><th>Slug</th><th>Image</th><th>Products</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.sort_order}</td>
                  <td><div className="data-table__name">{c.name_en}</div><div className="data-table__sub">{c.name_es}</div></td>
                  <td className="data-table__sub">{c.slug}</td>
                  <td>{c.image_url ? <img src={c.image_url} alt="" style={{ width: 48, height: 32, objectFit: "cover", borderRadius: 4 }} /> : <span className="muted">—</span>}</td>
                  <td>{c.product_count ?? 0}</td>
                  <td><span className={`chip chip--${c.is_active ? "published" : "inactive"}`}>{c.is_active ? "Active" : "Hidden"}</span></td>
                  <td><div className="data-table__actions" style={{ justifyContent: "flex-end" }}>
                    <button type="button" className="icon-action" aria-label="Edit" onClick={() => openEdit(c)}><Icon name="pencil" size={14} /></button>
                    <button type="button" className="icon-action icon-action--danger" aria-label="Delete" onClick={() => setToDelete(c.id)}><Icon name="trash" size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={toDelete !== null} title="Delete this collection?" text="The collection (and its product links) will be removed. This cannot be undone." onConfirm={() => { if (toDelete) doDelete(toDelete); setToDelete(null); }} onCancel={() => setToDelete(null)} />
    </div>
  );
}
