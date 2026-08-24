import "server-only";
import { q } from "./db";

export type MediaType = "hero" | "product" | "category" | "story" | "region" | "social" | "footer" | "logo";

export interface MediaRecord {
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
  created_at: string;
  updated_at: string;
}

export function listMedia(): Promise<MediaRecord[]> {
  return q<MediaRecord>("select * from public.media order by sort_order asc, created_at asc");
}

export function getMediaByKey(key: string): Promise<MediaRecord[]> {
  return q<MediaRecord>("select * from public.media where key = $1", [key]);
}

export interface MediaUpsert {
  key: string;
  url: string;
  storage_path?: string | null;
  type: MediaType;
  usage?: string | null;
  alt_en?: string | null;
  alt_es?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  sort_order?: number;
}

export async function upsertMedia(input: MediaUpsert): Promise<MediaRecord> {
  const rows = await q<MediaRecord>(
    `insert into public.media (key, url, storage_path, type, usage, alt_en, alt_es, entity_type, entity_id, sort_order)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,coalesce($10,0))
     on conflict (key) do update set
       url = excluded.url, storage_path = excluded.storage_path, type = excluded.type,
       usage = excluded.usage, alt_en = excluded.alt_en, alt_es = excluded.alt_es,
       entity_type = excluded.entity_type, entity_id = excluded.entity_id, sort_order = excluded.sort_order
     returning *`,
    [
      input.key,
      input.url,
      input.storage_path ?? null,
      input.type,
      input.usage ?? null,
      input.alt_en ?? null,
      input.alt_es ?? null,
      input.entity_type ?? null,
      input.entity_id ?? null,
      input.sort_order ?? 0,
    ],
  );
  return rows[0];
}

export async function deleteMedia(id: string): Promise<void> {
  await q("delete from public.media where id = $1", [id]);
}

export async function deleteMediaByStoragePath(storage_path: string): Promise<void> {
  await q("delete from public.media where storage_path = $1", [storage_path]);
}

/** Seed the Neon media table with the storefront's current default assets. */
export async function seedMediaDefaults(): Promise<void> {
  const { buildMediaSeed } = await import("@/lib/admin/media");
  const seed = buildMediaSeed();
  for (const a of seed) {
    await upsertMedia({
      key: a.key,
      url: a.src,
      storage_path: null,
      type: a.type as MediaType,
      usage: a.usage,
      alt_en: a.alt.en,
      alt_es: a.alt.es,
      sort_order: 0,
    });
  }
}
