// Newsletter subscribers schema (Neon). Run with: node --env-file=.env.local scripts/newsletter-schema.mjs
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const ddl = `
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  source text NOT NULL DEFAULT 'storefront',
  consent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created ON public.newsletter_subscribers(created_at DESC);
`;

try {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS citext`);
  await pool.query(ddl);
  console.log("newsletter_subscribers ready");
} finally {
  await pool.end();
}
