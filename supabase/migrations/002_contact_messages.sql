-- Run in Supabase SQL Editor.
-- Stores messages from the /contact form (collaborate / host / other).

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  intent text not null check (intent in ('collaborate', 'host', 'other')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- No public read/write policies. Inserts go through the service role
-- from the Next.js /api/contact route.
