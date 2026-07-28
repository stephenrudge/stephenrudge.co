-- Run in Supabase SQL Editor (free project).
-- Dashboard → SQL → New query → Run

create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  date date not null default current_date,
  excerpt text not null default '',
  location text not null default '',
  country text not null default '',
  country_flag text not null default '🌍',
  region text not null default 'Europe',
  trip_type text[] not null default '{}',
  tags text[] not null default '{}',
  cover_image text not null default '',
  lat double precision not null default 0,
  lng double precision not null default 0,
  featured boolean not null default false,
  draft boolean not null default true,
  scheduled_for timestamptz,
  content text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_date_idx on public.posts (date desc);
create index if not exists posts_draft_idx on public.posts (draft);

alter table public.posts enable row level security;

-- Public can only read live (non-draft, not future-scheduled) posts.
drop policy if exists "Public read live posts" on public.posts;
create policy "Public read live posts"
  on public.posts
  for select
  to anon, authenticated
  using (
    draft = false
    and (scheduled_for is null or scheduled_for <= now())
  );

-- Writes go through the service role key from the Next.js server (bypasses RLS).
-- No insert/update/delete policies for anon.
