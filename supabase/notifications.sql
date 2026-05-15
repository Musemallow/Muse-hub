-- MuseHub in-app notifications.
-- Run this before enabling push delivery workers.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  body text not null default '',
  href text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_length check (char_length(type) between 1 and 80),
  constraint notifications_title_length check (char_length(title) between 1 and 140),
  constraint notifications_body_length check (char_length(body) <= 500),
  constraint notifications_href_length check (href is null or char_length(href) <= 500),
  constraint notifications_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, read_at)
  where read_at is null;

alter table public.notifications enable row level security;

grant select on public.notifications to authenticated;
grant insert on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

drop policy if exists "Members can read own notifications" on public.notifications;
drop policy if exists "Members can create notifications" on public.notifications;
drop policy if exists "Members can mark own notifications read" on public.notifications;

create policy "Members can read own notifications"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Members can create notifications"
  on public.notifications
  for insert
  to authenticated
  with check (auth.uid() = actor_id or actor_id is null);

create policy "Members can mark own notifications read"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
