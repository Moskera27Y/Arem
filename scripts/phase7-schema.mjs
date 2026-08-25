// Phase 7 — customer accounts + wishlist + order foundation schema (Neon).
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const ddl = `
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  preferred_language text NOT NULL DEFAULT 'en',
  reset_token_hash text,
  reset_token_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON public.customer_profiles(email);

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id uuid NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  recipient_name text NOT NULL,
  phone text,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text,
  postal_code text,
  country text NOT NULL DEFAULT 'CO',
  is_default_shipping boolean NOT NULL DEFAULT false,
  is_default_billing boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_profile ON public.customer_addresses(customer_profile_id);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id uuid UNIQUE NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON public.wishlist_items(wishlist_id);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_profile_id uuid NOT NULL REFERENCES public.customer_profiles(id),
  status text NOT NULL DEFAULT 'pending_payment',
  payment_status text NOT NULL DEFAULT 'pending',
  currency text NOT NULL DEFAULT 'USD',
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  shipping_total numeric(12,2) NOT NULL DEFAULT 0,
  tax_total numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  shipping_address jsonb,
  billing_address jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  line_total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  carrier text,
  tracking_number text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);

CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  description text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment ON public.tracking_events(shipment_id);

-- Square-consent-safe payment reference model. NEVER stores card number, CVV,
-- expiry, raw tokens or access tokens — only safe references Square returns.
CREATE TABLE IF NOT EXISTS public.payment_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id uuid NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  square_customer_id text,
  square_card_id text,
  card_brand text,
  last_four text,
  expiry_month integer,
  expiry_year integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_customers_profile ON public.payment_customers(customer_profile_id);
`;

await pool.query(ddl);
console.log("Phase 7 schema applied.");
const { rows } = await pool.query(
  "select tablename from pg_tables where schemaname='public' and tablename in ('customer_profiles','customer_addresses','wishlists','wishlist_items','orders','order_items','shipments','tracking_events','payment_customers') order by tablename"
);
console.log("tables:", rows.map((r) => r.tablename).join(", "));
await pool.end();
