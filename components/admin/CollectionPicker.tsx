"use client";

import { useEffect, useMemo, useState } from "react";

interface ColOption { id: string; name_en: string; name_es: string; is_active: boolean }

/** Multi-select "COLECCIONES" for a product (N:M via Neon pivot). */
export function CollectionPicker({ productId }: { productId?: string }) {
  const [cols, setCols] = useState<ColOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/collections");
      const rows = (r.ok ? await r.json() : []) as ColOption[];
      setCols(rows);
      if (productId) {
        const pr = await fetch(`/api/admin/products/${productId}/collections`);
        if (pr.ok) setSelected(((await pr.json()) as { collection_ids?: string[] }).collection_ids ?? []);
      }
      setLoading(false);
    })();
  }, [productId]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function save() {
    if (!productId) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${productId}/collections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_ids: selected }),
      });
    } finally {
      setSaving(false);
    }
  }

  const options = useMemo(() => [...cols].sort((a, b) => (a.name_en < b.name_en ? -1 : 1)), [cols]);

  if (loading) return <p className="muted">Loading collections…</p>;

  return (
    <div>
      <div className="admin-form__grid admin-form__grid--3">
        {options.map((c) => (
          <label key={c.id} className="acc-check" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "0.5rem 0.75rem" }}>
            <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
            <span>{c.name_en}{c.is_active ? "" : " (hidden)"}</span>
          </label>
        ))}
      </div>
      {options.length === 0 && <p className="muted">No collections yet.</p>}
      {productId ? (
        <button type="button" className="btn btn--secondary btn--sm" onClick={save} disabled={saving} style={{ marginTop: "0.5rem" }}>
          {saving ? "Saving…" : "Save collections"}
        </button>
      ) : (
        <p className="acc-note">Guarda primero el producto para asignar colecciones.</p>
      )}
    </div>
  );
}
