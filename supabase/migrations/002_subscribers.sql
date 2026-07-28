-- Run in Supabase SQL Editor after 001_posts.sql.
-- Stores email addresses from the site subscribe form.

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint subscribers_email_unique unique (email)
);

create index if not exists subscribers_created_at_idx
  on public.subscribers (created_at desc);

alter table public.subscribers enable row level security;

-- No public read/write policies. Inserts go through the service role
-- from the Next.js /api/subscribe route.
