"use client";

/**
 * Media library — view, replace and manage every public-facing visual asset.
 * URLs + metadata persist in the local prototype data layer; local file
 * selection is a per-session preview only (no cloud storage yet). Architecture
 * is ready for Supabase Storage / another image host.
 */

import { useMemo, useRef, useState } from "react";
import { MEDIA_TYPES, type MediaAsset, type MediaType } from "@/lib/admin/types";
import { sortMedia } from "@/lib/admin/media";
import { useAdminStore } from "@/lib/admin/store";
import { ConfirmDialog, EmptyState, Field, PageHead } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icons";

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

const typeLabel = (t: MediaType) => MEDIA_TYPES.find((x) => x.id === t)?.label ?? t;

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
  const { mediaAssets, upsertMedia, deleteMedia, hydrated } = useAdminStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaType>("all");
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [toRemove, setToRemove] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [confirmReplace, setConfirmReplace] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = sortMedia(mediaAssets);
    if (typeFilter !== "all") list = list.filter((a) => a.type === typeFilter);
    if (q) {
      list = list.filter((a) => `${a.usage} ${a.alt.en} ${a.alt.es} ${a.src}`.toLowerCase().includes(q));
    }
    return list;
  }, [mediaAssets, search, typeFilter]);

  const countByType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of mediaAssets) map[a.type] = (map[a.type] ?? 0) + 1;
    return map;
  }, [mediaAssets]);

  const removeMedia = () => {
    if (toRemove) deleteMedia(toRemove);
    setToRemove(null);
  };

  return (
    <>
      <PageHead
        title="Media library"
        sub="Manage every public-facing image. Changes appear on the storefront immediately."
        action={<LinkStats count={mediaAssets.length} />}
      />

      <div className="admin-toolbar">
        <input
          className="input"
          type="search"
          placeholder="Search media…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search media"
        />
        <select
          className="select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | MediaType)}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} ({countByType[t.id] ?? 0})
            </option>
          ))}
        </select>
      </div>

      {!hydrated ? null : filtered.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            icon="image"
            title={search || typeFilter !== "all" ? "No matching media" : "No media assets yet"}
            text={
              search || typeFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Media assets will appear here as the storefront grows."
            }
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
                <img src={asset.src} alt={asset.alt.en} loading="lazy" />
                <span className="media-card__type">{typeLabel(asset.type)}</span>
              </span>
              <span className="media-card__name">{asset.usage}</span>
              <span className="media-card__meta">Alt: {asset.alt.en}</span>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <MediaEditModal
          asset={editing}
          onCancel={() => setEditing(null)}
          onSave={(asset) => {
            upsertMedia(asset);
            setEditing(null);
          }}
          onDelete={() => {
            setToRemove(editing.id);
            setEditing(null);
          }}
          confirmReplace={confirmReplace}
          setConfirmReplace={setConfirmReplace}
          error={error}
          setError={setError}
        />
      )}

      <ConfirmDialog
        open={toRemove !== null}
        title="Remove this image?"
        text="Removing an image may leave its location without a visual. This cannot be undone."
        onConfirm={removeMedia}
        onCancel={() => setToRemove(null)}
      />
    </>
  );
}

function MediaEditModal({
  asset,
  onCancel,
  onSave,
  onDelete,
  confirmReplace,
  setConfirmReplace,
  error,
  setError,
}: {
  asset: MediaAsset;
  onCancel: () => void;
  onSave: (asset: MediaAsset) => void;
  onDelete: () => void;
  confirmReplace: boolean;
  setConfirmReplace: (v: boolean) => void;
  error?: string;
  setError: (v?: string) => void;
}) {
  const [draft, setDraft] = useState<MediaAsset>({ ...asset });
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const previewSrc = filePreview ?? draft.src;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    // Local prototype preview only — object URLs do not persist across reloads.
    setFilePreview(URL.createObjectURL(file));
  };

  const save = () => {
    if (!isValidSrc(draft.src)) {
      setError("Enter a valid image URL (https://…) or a /images/… placeholder.");
      return;
    }
    // Replacing an existing asset URL requires confirmation once.
    if (draft.src !== asset.src && !confirmReplace && !filePreview) {
      setConfirmReplace(true);
      setError("This replaces the current image. Confirm to proceed.");
      return;
    }
    const firstError = false;
    if (firstError) return;
    // A local file preview is never persisted (prototype only).
    onSave({ ...draft, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={`Edit media: ${asset.usage}`}>
      <div className="admin-modal__panel">
        <div className="admin-modal__head">
          <h2 className="admin-modal__title">{asset.usage}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onCancel}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="admin-modal__body">
          <div className="media-edit">
            <div className="media-edit__preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc} alt={draft.alt.en} />
              {filePreview && (
                <p className="media-edit__note">
                  Local file preview only — set a URL or placeholder to persist.
                </p>
              )}
            </div>

            <div className="admin-form" style={{ gap: "1rem" }}>
              <Field label="Image URL / placeholder">
                <datalist id="arem-media-placeholders">
                  {PLACEHOLDERS.map((src) => (
                    <option key={src} value={src} />
                  ))}
                </datalist>
                <input
                  className="input"
                  list="arem-media-placeholders"
                  value={draft.src}
                  onChange={(e) => {
                    setDraft({ ...draft, src: e.target.value });
                    setError(undefined);
                    setFilePreview(null);
                    setConfirmReplace(false);
                  }}
                />
              </Field>

              <Field label="Upload (prototype preview)" hint="Preview only — not stored permanently.">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="input"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </Field>

              <Field label="Alt text (English)">
                <input
                  className="input"
                  value={draft.alt.en}
                  onChange={(e) => setDraft({ ...draft, alt: { ...draft.alt, en: e.target.value } })}
                />
              </Field>
              <Field label="Alt text (Spanish)">
                <input
                  className="input"
                  value={draft.alt.es}
                  onChange={(e) => setDraft({ ...draft, alt: { ...draft.alt, es: e.target.value } })}
                />
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
          <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn--ghost-danger btn--sm" onClick={onDelete}>
            <Icon name="trash" size={14} /> Remove
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={save}>
            <Icon name="check" size={15} /> {confirmReplace ? "Confirm replace" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkStats({ count }: { count: number }) {
  return <span className="chip chip--published">{count} assets</span>;
}
