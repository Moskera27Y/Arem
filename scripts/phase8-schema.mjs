// Phase 8A — exchange-rate cache table + display-currency column.
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const ddl = `
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  base_currency text NOT NULL DEFAULT 'USD',
  currency text NOT NULL,
  rate numeric(20,8) NOT NULL,
  source text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (base_currency, currency)
);

ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS display_currency text NOT NULL DEFAULT 'USD';

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS display_currency text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS usd_total_cents bigint;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS exchange_rate numeric(20,8);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS converted_total_cents bigint;
`;

await pool.query(ddl);
console.log("Phase 8A schema applied.");
const { rows } = await pool.query(
  "select column_name, data_type from information_schema.columns where table_name='customer_profiles' and column_name='display_currency'"
);
console.log("customer_profiles.display_currency:", rows);
const { rows: t } = await pool.query(
  "select tablename from pg_tables where schemaname='public' and tablename='exchange_rates'"
);
console.log("exchange_rates table:", t.map((r) => r.tablename).join(", "));
await pool.end();
