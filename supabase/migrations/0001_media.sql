-- AREM WORLD — Supabase schema: persistent media + secure Admin (RLS).
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- No secrets are stored in this file.

-- 1) Authorized admin emails
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);
insert into public.admin_users (email) values ('Moskera15@gmail.com')
on conflict (email) do nothing;

-- Helper: is the signed-in user an authorized admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = coalesce(auth.jwt() ->> 'email', '')
  );
$$;

-- 2) Media table (replaces the prototype localStorage media layer)
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,          -- stable asset key / original path
  url text not null,                 -- public image URL
  storage_path text,                 -- Storage object path when uploaded
  type text not null check (type in ('hero','product','category','story','region','social','footer','logo')),
  usage text,                        -- human-readable location label
  alt_en text,
  alt_es text,
  entity_type text,                  -- linked entity type (product/category/story/region) when applicable
  entity_id text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists media_type_idx on public.media (type);
create index if not exists media_key_idx on public.media (key);
create index if not exists media_entity_idx on public.media (entity_type, entity_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists media_touch on public.media;
create trigger media_touch before update on public.media
for each row execute function public.touch_updated_at();

-- 3) Row Level Security — public read; admin write only
alter table public.media enable row level security;

drop policy if exists "media_select_public" on public.media;
create policy "media_select_public" on public.media for select using (true);

drop policy if exists "media_insert_admin" on public.media;
create policy "media_insert_admin" on public.media for insert with check (public.is_admin());
drop policy if exists "media_update_admin" on public.media;
create policy "media_update_admin" on public.media for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "media_delete_admin" on public.media;
create policy "media_delete_admin" on public.media for delete using (public.is_admin());

-- 4) Storage policies for the `arem-media` bucket (public read, admin write)
drop policy if exists "media_storage_read" on storage.objects;
create policy "media_storage_read" on storage.objects for select using (bucket_id = 'arem-media');
drop policy if exists "media_storage_insert" on storage.objects;
create policy "media_storage_insert" on storage.objects for insert with check (bucket_id = 'arem-media' and public.is_admin());
drop policy if exists "media_storage_update" on storage.objects;
create policy "media_storage_update" on storage.objects for update using (bucket_id = 'arem-media' and public.is_admin());
drop policy if exists "media_storage_delete" on storage.objects;
create policy "media_storage_delete" on storage.objects for delete using (bucket_id = 'arem-media' and public.is_admin());

grant usage on schema storage to anon, authenticated;
