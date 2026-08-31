// Commerce schema: Square payments + webhook idempotency + shipment fields.
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const ddl = `
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS square_payment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS square_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS estimated_delivery timestamptz;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS last_tracking_update timestamptz;

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  square_payment_id text,
  square_order_id text,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_square ON public.payments(square_payment_id);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  event_id text PRIMARY KEY,
  provider text NOT NULL,
  type text NOT NULL,
  payload jsonb,
  processed_at timestamptz NOT NULL DEFAULT now()
);
`;
await pool.query(ddl);
const { rows } = await pool.query(
  "select tablename from pg_tables where schemaname='public' and tablename in ('payments','webhook_events')"
);
console.log("tables:", rows.map((r) => r.tablename).join(", "));
await pool.end();
