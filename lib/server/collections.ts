import "server-only";
import { q } from "./db";

export interface CollectionRow {
  id: string;
  name_en: string;
  name_es: string;
  slug: string;
  description_en: string | null;
  description_es: string | null;
  tagline_en: string | null;
  tagline_es: string | null;
  story_en: string | null;
  story_es: string | null;
  image_key: string | null;
  image_url: string | null;
  image_alt_en: string | null;
  image_alt_es: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function listCollections(opts: { activeOnly?: boolean } = {}): Promise<CollectionRow[]> {
  const where = opts.activeOnly ? "where is_active = true" : "";
  return q<CollectionRow>(`select * from public.collections ${where} order by sort_order, created_at`, []);
}

export async function listCollectionIds(): Promise<string[]> {
  const rows = await q<{ id: string }>("select id from public.collections");
  return rows.map((r) => r.id);
}

export async function getCollection(id: string): Promise<CollectionRow | null> {
  const rows = await q<CollectionRow>("select * from public.collections where id = $1", [id]);
  return rows[0] ?? null;
}

export async function getCollectionBySlug(slug: string): Promise<CollectionRow | null> {
  const rows = await q<CollectionRow>("select * from public.collections where slug = $1", [slug]);
  return rows[0] ?? null;
}

export async function upsertCollection(c: {
  id?: string;
  name_en: string;
  name_es: string;
  slug: string;
  description_en?: string | null;
  description_es?: string | null;
  tagline_en?: string | null;
  tagline_es?: string | null;
  story_en?: string | null;
  story_es?: string | null;
  image_key?: string | null;
  image_url?: string | null;
  image_alt_en?: string | null;
  image_alt_es?: string | null;
  is_active?: boolean;
  sort_order?: number;
}): Promise<CollectionRow> {
  const id = c.id ?? `col-${Math.random().toString(36).slice(2, 10)}`;
  const rows = await q<CollectionRow>(
    `insert into public.collections
       (id, name_en, name_es, slug, description_en, description_es, tagline_en, tagline_es, story_en, story_es,
        image_key, image_url, image_alt_en, image_alt_es, is_active, sort_order)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     on conflict (id) do update set
       name_en=$2, name_es=$3, slug=$4, description_en=$5, description_es=$6, tagline_en=$7, tagline_es=$8,
       story_en=$9, story_es=$10, image_key=$11, image_url=$12, image_alt_en=$13, image_alt_es=$14,
       is_active=$15, sort_order=$16, updated_at=now()
     returning *`,
    [
      id, c.name_en, c.name_es, c.slug,
      c.description_en ?? null, c.description_es ?? null, c.tagline_en ?? null, c.tagline_es ?? null,
      c.story_en ?? null, c.story_es ?? null,
      c.image_key ?? null, c.image_url ?? null, c.image_alt_en ?? null, c.image_alt_es ?? null,
      c.is_active ?? true, c.sort_order ?? 0,
    ],
  );
  return rows[0];
}

export async function deleteCollection(id: string): Promise<void> {
  await q("delete from public.collections where id = $1", [id]);
}

export async function listProductIdsForCollection(collectionId: string): Promise<string[]> {
  const rows = await q<{ product_id: string }>(
    "select product_id from public.product_collections where collection_id = $1 order by created_at",
    [collectionId],
  );
  return rows.map((r) => r.product_id);
}

export async function productCount(collectionId: string): Promise<number> {
  const rows = await q<{ n: string }>(
    "select count(*)::text as n from public.product_collections where collection_id = $1",
    [collectionId],
  );
  return Number(rows[0]?.n ?? 0);
}

export async function setProductIds(collectionId: string, ids: string[]): Promise<void> {
  await q("delete from public.product_collections where collection_id = $1", [collectionId]);
  for (const id of ids) {
    await q(
      "insert into public.product_collections (collection_id, product_id) values ($1,$2) on conflict do nothing",
      [collectionId, id],
    );
  }
}

/** Product-centric: set which collections a product belongs to. */
export async function getProductCollectionIds(productId: string): Promise<string[]> {
  const rows = await q<{ collection_id: string }>(
    "select collection_id from public.product_collections where product_id = $1 order by created_at",
    [productId],
  );
  return rows.map((r) => r.collection_id);
}

export async function setProductCollections(productId: string, collectionIds: string[]): Promise<void> {
  // Remove associations the product is no longer in.
  await q("delete from public.product_collections where product_id = $1 and not (collection_id = any($2))", [
    productId,
    collectionIds,
  ]);
  for (const collectionId of collectionIds) {
    await q(
      "insert into public.product_collections (collection_id, product_id) values ($1,$2) on conflict do nothing",
      [collectionId, productId],
    );
  }
}
