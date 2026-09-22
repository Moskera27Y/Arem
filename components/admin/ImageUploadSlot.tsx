"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (matches /api/admin/upload)

interface ImageUploadSlotProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

/**
 * Product image slot: keeps the URL input (placeholders / external links)
 * and adds a file picker for PC folders and mobile files/camera
 * (`accept="image/*"` lets the mobile OS offer camera, gallery or files).
 * Uploads go to Vercel Blob via /api/admin/upload with progress + errors.
 */
export function ImageUploadSlot({ value, onChange, onRemove }: ImageUploadSlotProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function onFile(f: File | undefined) {
    if (!f || uploading) return;
    if (!f.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG, WebP…).");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("El archivo supera 5 MB. Comprímelo e inténtalo de nuevo.");
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);
    const form = new FormData();
    form.append("file", f);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const d = JSON.parse(xhr.responseText) as { url?: string; error?: string };
          if (d.url) {
            onChange(d.url);
            return;
          }
          setError(d.error || "El servidor no devolvió URL.");
        } catch {
          setError("Respuesta inválida del servidor.");
        }
      } else if (xhr.status === 401) {
        setError("Sesión vencida. Recarga e inicia sesión de nuevo.");
      } else if (xhr.status === 413) {
        setError("El archivo es demasiado grande.");
      } else {
        try {
          const d = JSON.parse(xhr.responseText) as { error?: string };
          setError(d.error || "Error al subir el archivo.");
        } catch {
          setError("Error al subir el archivo.");
        }
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setError("Error de conexión. Revisa tu internet e inténtalo de nuevo.");
    };
    xhr.send(form);
  }

  return (
    <div className="image-slot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="image-slot__preview" src={value || "/images/cat-textiles.svg"} alt="" />
      <div className="image-slot__fields">
        <input
          className="input"
          list="arem-placeholders"
          value={value}
          disabled={uploading}
          onChange={(e) => {
            setError(null);
            onChange(e.target.value);
          }}
          placeholder="/images/… or https://…"
          aria-label="URL de imagen"
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              opacity: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="image" size={13} /> {uploading ? `Subiendo… ${progress}%` : "Subir archivo"}
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            style={{ alignSelf: "flex-start" }}
            disabled={uploading}
            onClick={onRemove}
          >
            <Icon name="trash" size={13} /> Remove
          </button>
        </div>
        {uploading && (
          <div className="upload-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Subiendo imagen">
            <div className="upload-progress__bar" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && (
          <p className="form-status form-status--error" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
