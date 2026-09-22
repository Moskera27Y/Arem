// Contact inbox schema (Neon). Run with: node --env-file=.env.local scripts/contact-schema.mjs
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const ddl = `
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  topic text NOT NULL DEFAULT 'other',
  message text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  consent_at timestamptz NOT NULL DEFAULT now(),
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);
`;

try {
  await pool.query(ddl);
  console.log("contact_messages ready");
} finally {
  await pool.end();
}
