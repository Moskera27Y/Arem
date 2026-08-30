// FASE 1 — e-commerce schema: guest orders + real inventory.
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const ddl = `
-- Allow guest checkout (customer optional) + guest/order fields.
ALTER TABLE public.orders ALTER COLUMN customer_profile_id DROP NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE PUBLIC.orders ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes text;

-- Real inventory: one row per variant, stock/reserved.
CREATE TABLE IF NOT EXISTS public.product_inventory (
  variant_id text PRIMARY KEY,
  product_id text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  reserved integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pi_product ON public.product_inventory(product_id);

-- Order items snapshots: variant + SKU.
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_id text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_name text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS sku text;
`;

await pool.query(ddl);
const { rows } = await pool.query(
  "select column_name from information_schema.columns where table_name='orders' and column_name in ('email','payment_method','shipping_method')"
);
console.log("orders guest cols:", rows.map((r) => r.column_name).join(", "));
const { rows: t } = await pool.query("select tablename from pg_tables where schemaname='public' and tablename='product_inventory'");
console.log("product_inventory:", t.map((r) => r.tablename).join(", "));
await pool.end();
