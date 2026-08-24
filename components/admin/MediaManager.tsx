"use client";

/**
 * Media library — backed by Neon (persistent DB) + Vercel Blob (real uploads).
 * List, replace, upload and delete public images. Changes persist across
 * refresh, devices and deployments; the storefront reads the same data.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MEDIA_TYPES, type MediaType } from "@/lib/admin/types";
import { ConfirmDialog, EmptyState, Field, PageHead } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icons";

interface MediaItem {
  id: string;
  key: string;
  url: string;
  storage_path: string | null;
  type: MediaType;
  usage: string | null;
  alt_en: string | null;
  alt_es: string | null;
  entity_type: string | null;
  entity_id: string | null;
  sort_order: number;
  created_at?: string;
}

const PLACEHOLDERS = [
  "/images/hero-main.svg",
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
  "/images/s-tejer.svg",
  "/images/s-cafe.svg",
  "/images/s-barro.svg",
  "/images/brand-1.svg",
];

const typeLabel = (t: string) => MEDIA_TYPES.find((x) => x.id === t)?.label ?? t;

function isValidSrc(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^\/images\/[\w./-]+$/.test(v)) return true;
  try {
    const u = new URL(v, "http://localhost");
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function MediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaType>("all");
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [toRemove, setToRemove] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [confirmReplace, setConfirmReplace] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const rows = (await res.json()) as MediaItem[];
      setMedia(Array.isArray(rows) ? rows : []);
    } catch {
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...media].sort((a, b) => {
      const order = a.sort_order - b.sort_order;
      if (order !== 0) return order;
      return (a.created_at ?? "").localeCompare(b.created_at ?? "");
    });
    if (typeFilter !== "all") list = list.filter((a) => a.type === typeFilter);
    if (q) list = list.filter((a) => `${a.usage} ${a.alt_en} ${a.alt_es} ${a.key}`.toLowerCase().includes(q));
    return list;
  }, [media, search, typeFilter]);

  const countByType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of media) map[a.type] = (map[a.type] ?? 0) + 1;
    return map;
  }, [media]);

  async function removeMedia() {
    if (!toRemove) return;
    try {
      const res = await fetch(`/api/media?id=${encodeURIComponent(toRemove)}`, { method: "DELETE" });
      if (res.ok) {
        setStatus({ ok: true, message: "Imagen eliminada." });
        await load();
      } else {
        setStatus({ ok: false, message: "No se pudo eliminar." });
      }
    } catch {
      setStatus({ ok: false, message: "Error al eliminar." });
    }
    setToRemove(null);
  }

  return (
    <>
      <PageHead
        title="Media library"
        sub="Imágenes persistentes (Neon + Vercel Blob). Los cambios se reflejan en la tienda al instante."
        action={<span className="chip chip--published">{media.length} assets</span>}
      />

      <div className="admin-toolbar">
        <input
          className="input"
          type="search"
          placeholder="Buscar media…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar media"
        />
        <select
          className="select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | MediaType)}
          aria-label="Filtrar por tipo"
        >
          <option value="all">Todos los tipos</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} ({countByType[t.id] ?? 0})
            </option>
          ))}
        </select>
      </div>

      {status && (
        <div className={`form-status ${status.ok ? "form-status--ok" : "admin-form__error-summary"}`} role="status" style={{ marginBottom: "1rem" }}>
          {status.message}
        </div>
      )}

      {loading ? (
        <p className="muted">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            icon="image"
            title={search || typeFilter !== "all" ? "Sin resultados" : "Aún no hay media"}
            text={search || typeFilter !== "all" ? "Ajusta la búsqueda o el filtro." : "Las imágenes aparecerán aquí al migrar el contenido."}
          />
        </div>
      ) : (
        <div className="media-grid">
          {filtered.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className="media-card"
              onClick={() => {
                setEditing({ ...asset });
                setError(undefined);
                setConfirmReplace(false);
              }}
            >
              <span className="media-card__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.alt_en ?? ""} loading="lazy" />
                <span className="media-card__type">{typeLabel(asset.type)}</span>
              </span>
              <span className="media-card__name">{asset.usage || asset.key}</span>
              <span className="media-card__meta">Alt: {asset.alt_en}</span>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <MediaEditModal
          asset={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setConfirmReplace(false);
            setStatus({ ok: true, message: "Imagen guardada. La tienda ya refleja el cambio." });
            load();
          }}
          onDeleteRequest={() => {
            setToRemove(editing.id);
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={toRemove !== null}
        title="¿Eliminar esta imagen?"
        text="La imagen se quitará de la tienda y, si fue subida, también el archivo. Esto no se puede deshacer."
        onConfirm={removeMedia}
        onCancel={() => setToRemove(null)}
      />
    </>
  );
}

function MediaEditModal({
  asset,
  onClose,
  onSaved,
  onDeleteRequest,
}: {
  asset: MediaItem;
  onClose: () => void;
  onSaved: () => void;
  onDeleteRequest: () => void;
}) {
  const [draft, setDraft] = useState<MediaItem>({ ...asset });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // object URL while upload pending
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const previewSrc = preview ?? draft.url;
  const replacing = draft.url !== asset.url;

  function onFile(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(undefined);
    setConfirmReplace(false);
  }

  async function uploadFile(): Promise<{ url: string; pathname: string } | null> {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/upload");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error("Respuesta inválida"));
          }
        } else {
          reject(new Error("Error de subida"));
        }
      };
      xhr.onerror = () => reject(new Error("Error de conexión"));
      xhr.send(form);
    });
  }

  async function save() {
    if (!isValidSrc(draft.url)) {
      setError("Ingresa una URL válida (https://…) o un placeholder /images/….");
      return;
    }
    if (replacing && !confirmReplace && !file) {
      setConfirmReplace(true);
      setError("Está reemplazando la imagen actual. Confirma para continuar.");
      return;
    }
    setSaving(true);
    setProgress(0);
    try {
      let url = draft.url;
      let storagePath = draft.storage_path;
      if (file) {
        const up = await uploadFile();
        if (!up) throw new Error("No se pudo subir el archivo");
        url = up.url;
        storagePath = up.pathname;
      }
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: draft.key,
          url,
          storage_path: storagePath,
          type: draft.type,
          usage: draft.usage,
          alt_en: draft.alt_en,
          alt_es: draft.alt_es,
          entity_type: draft.entity_type,
          entity_id: draft.entity_id,
          sort_order: draft.sort_order,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al guardar");
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={`Editar media: ${asset.usage || asset.key}`}>
      <div className="admin-modal__panel">
        <div className="admin-modal__head">
          <h2 className="admin-modal__title">{asset.usage || asset.key}</h2>
          <button type="button" className="icon-btn" aria-label="Cerrar" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="admin-modal__body">
          <div className="media-edit">
            <div className="media-edit__preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc} alt={draft.alt_en ?? ""} />
              {saving && file && <p className="media-edit__note">Subiendo… {progress}%</p>}
            </div>

            <div className="admin-form" style={{ gap: "1rem" }}>
              <Field label="URL de imagen / placeholder">
                <datalist id="arem-media-placeholders">
                  {PLACEHOLDERS.map((src) => (
                    <option key={src} value={src} />
                  ))}
                </datalist>
                <input
                  className="input"
                  list="arem-media-placeholders"
                  value={draft.url}
                  onChange={(e) => {
                    setDraft({ ...draft, url: e.target.value });
                    setPreview(null);
                    setFile(null);
                    setError(undefined);
                    setConfirmReplace(false);
                  }}
                />
              </Field>

              <Field label="Subir archivo" hint="Sube a Vercel Blob; se guarda la URL pública.">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif"
                  className="input"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </Field>

              <Field label="Alt (inglés)">
                <input className="input" value={draft.alt_en ?? ""} onChange={(e) => setDraft({ ...draft, alt_en: e.target.value })} />
              </Field>
              <Field label="Alt (español)">
                <input className="input" value={draft.alt_es ?? ""} onChange={(e) => setDraft({ ...draft, alt_es: e.target.value })} />
              </Field>

              {error && (
                <div className="admin-form__error-summary" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-modal__actions">
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn--ghost-danger btn--sm" onClick={onDeleteRequest}>
            <Icon name="trash" size={14} /> Eliminar
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={save} disabled={saving}>
            <Icon name="check" size={15} /> {saving ? "Guardando…" : confirmReplace ? "Confirmar reemplazo" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
