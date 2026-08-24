// Create the Neon schema and (re)seed the admin user.
// Run: node --env-file=.env.local scripts/setup-db.mjs
import bcrypt from "bcryptjs";
import { query } from "./db.mjs";

const SCHEMA = `
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  url text not null,
  storage_path text,
  type text not null check (type in ('hero','product','category','story','region','social','footer','logo')),
  usage text,
  alt_en text,
  alt_es text,
  entity_type text,
  entity_id text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists media_type_idx on public.media (type);
create index if not exists media_key_idx on public.media (key);
create index if not exists media_entity_idx on public.media (entity_type, entity_id);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);
`;

async function main() {
  await query(SCHEMA);
  console.log("schema ok");

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD not set");

  const hash = await bcrypt.hash(password, 10);
  await query(
    `insert into public.admin_users (email, password_hash) values ($1, $2)
     on conflict (email) do update set password_hash = excluded.password_hash`,
    [email, hash],
  );
  console.log("admin seeded:", email);

  const admins = await query("select email from public.admin_users order by email");
  console.log("admins:", JSON.stringify(admins.rows));
  const media = await query("select count(*)::int as n from public.media");
  console.log("media rows:", media.rows[0].n);
}

main().catch((e) => {
  console.error("SETUP FAILED:", e.message);
  process.exit(1);
});
