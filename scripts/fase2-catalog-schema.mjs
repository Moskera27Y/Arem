// Phase 2 — catalog schema: products, variants, categories, promotions.
// Idempotent: CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS.
// Reuses existing product_inventory, collections, product_collections, media.
import { getDb, query } from "./db.mjs";

const ddl = `
-- ── products ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                     text PRIMARY KEY,
  slug                   text UNIQUE NOT NULL,
  name_en                text NOT NULL,
  name_es                text NOT NULL,
  tagline_en             text,
  tagline_es             text,
  description_en         text,
  description_es         text,
  story_en               jsonb,   -- array of paragraphs (bilingual)
  story_es               jsonb,
  details_en             jsonb,   -- array of bullets (bilingual)
  details_es             jsonb,
  price_cents            integer NOT NULL,
  compare_at_price_cents integer,
  options_en             jsonb,   -- [{ id, name, values[] }]
  options_es             jsonb,
  featured               boolean NOT NULL DEFAULT false,
  badge_en               text,
  badge_es               text,
  status                 text NOT NULL DEFAULT 'active'
                          check (status in ('active','draft','archived')),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_status   ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (featured);

-- trigger para updated_at
CREATE OR REPLACE FUNCTION public.touch_updated()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated();

-- ── product_variants ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id              text PRIMARY KEY,
  product_id      text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku             text UNIQUE,
  title_en        text NOT NULL,
  title_es        text NOT NULL,
  option_values   jsonb,   -- { color: { en, es } }
  price_cents     integer NOT NULL,
  compare_at_cents integer,
  image_url       text,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants (product_id);
DROP TRIGGER IF EXISTS trg_variants_updated ON public.product_variants;
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated();

-- Reasociar product_inventory a product_variants (FK opcional, no destructivo).
ALTER TABLE public.product_inventory
  ADD COLUMN IF NOT EXISTS variant_id_fk text
    REFERENCES public.product_variants(id) ON DELETE RESTRICT;
-- Backfill: apuntar variant_id_fk al propio variant_id si la variante existe.
UPDATE public.product_inventory
SET variant_id_fk = variant_id
WHERE variant_id_fk IS NULL
  AND EXISTS (SELECT 1 FROM public.product_variants v WHERE v.id = product_inventory.variant_id);
CREATE INDEX IF NOT EXISTS idx_pi_variant_fk ON public.product_inventory (variant_id_fk);

-- ── product_images ───────────────────────────────────────────────────
-- Orden + primary flag; media.key es la fuente canónica de assets,
-- product_images solo enlaza productos/variantes con media ordenado.
CREATE TABLE IF NOT EXISTS public.product_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   text REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id   text REFERENCES public.product_variants(id) ON DELETE CASCADE,
  media_key    text NOT NULL REFERENCES public.media(key) ON DELETE RESTRICT,
  sort_order   integer NOT NULL DEFAULT 0,
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, media_key)
);
CREATE INDEX IF NOT EXISTS idx_pi_product   ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_pi_variant   ON public.product_images (variant_id);
CREATE INDEX IF NOT EXISTS idx_pi_sort      ON public.product_images (product_id, sort_order);

-- ── categories ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id           text PRIMARY KEY,
  slug         text UNIQUE NOT NULL,
  name_en      text NOT NULL,
  name_es      text NOT NULL,
  short_name_en text,
  short_name_es text,
  description_en text,
  description_es text,
  image_src    text,
  image_alt_en text,
  image_alt_es text,
  featured     boolean NOT NULL DEFAULT false,
  enabled      boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug    ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON public.categories (featured);
DROP TRIGGER IF EXISTS trg_categories_updated ON public.categories;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated();

-- ── product_categories (many-to-many) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id  text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id text NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_pc_category ON public.product_categories (category_id);
CREATE INDEX IF NOT EXISTS idx_pc_product  ON public.product_categories (product_id);

-- ── promotions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promotions (
  id               text PRIMARY KEY,
  name             text NOT NULL,
  description      text,
  type             text NOT NULL
                     check (type in ('percentage','fixed','free-shipping','announcement')),
  value            integer NOT NULL DEFAULT 0,
  start_date       timestamptz,
  end_date         timestamptz,
  active           boolean NOT NULL DEFAULT true,
  min_purchase_cents integer,
  max_usage        integer,
  usage_count      integer NOT NULL DEFAULT 0,
  announcement_en  text,
  announcement_es  text,
  collection_ids   text[],
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotions_active    ON public.promotions (active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates     ON public.promotions (start_date, end_date);
DROP TRIGGER IF EXISTS trg_promotions_updated ON public.promotions;
CREATE TRIGGER trg_promotions_updated BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated();

-- ── promotion target pivots (many-to-many) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.promotion_products (
  promotion_id text NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  product_id   text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_pp_product ON public.promotion_products (product_id);

CREATE TABLE IF NOT EXISTS public.promotion_categories (
  promotion_id  text NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  category_id   text NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_pc2_category ON public.promotion_categories (category_id);

CREATE TABLE IF NOT EXISTS public.promotion_collections (
  promotion_id  text NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  collection_id text NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, collection_id)
);
CREATE INDEX IF NOT EXISTS idx_pc3_collection ON public.promotion_collections (collection_id);
`;

console.log("Applying catalog schema...");
await query(ddl);
console.log("Catalog schema applied.");

// Verificación
const { rows } = await query(`
  select tablename from pg_tables
  where schemaname='public'
  and tablename in ('products','product_variants','product_images','categories',
                    'product_categories','promotions','promotion_products',
                    'promotion_categories','promotion_collections')
  order by tablename
`);
console.log("Created/reused tables:", rows.map((r) => r.tablename).join(", "));

const fkCheck = await query(`
  select conname, conrelid::regclass as table_name
  from pg_constraint
  where contype='f' and connamespace='public'::regnamespace
  and conrelid::regclass::text in
    ('products','product_variants','product_images','product_categories',
     'promotions','promotion_products','promotion_categories','promotion_collections')
`);
console.log("FKs:", fkCheck.rows.map((r) => `${r.conname}@${r.table_name}`).join(", "));

const db = getDb();
await db.end();
