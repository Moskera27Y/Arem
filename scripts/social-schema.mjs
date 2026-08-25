// Phase 8C — social_links table (Neon source of truth for public socials).
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const ddl = `
CREATE TABLE IF NOT EXISTS public.social_links (
  id text PRIMARY KEY,
  network text NOT NULL,
  label text,
  value text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  post_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_social_links_network ON public.social_links(network);
`;
await pool.query(ddl);
const { rows } = await pool.query("select tablename from pg_tables where schemaname='public' and tablename='social_links'");
console.log("social_links:", rows.map((r) => r.tablename).join(", "));
await pool.end();
