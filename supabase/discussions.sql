-- MuseHub Discord-lite discussion messages.
-- Run this after supabase/schema.sql so member chat can persist replies.

create table if not exists public.discussion_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  attachment jsonb,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discussion_messages_channel_id_length check (char_length(channel_id) between 1 and 80),
  constraint discussion_messages_body_length check (char_length(body) <= 2000),
  constraint discussion_messages_has_content check (
    char_length(body) > 0 or attachment is not null
  ),
  constraint discussion_messages_attachment_object check (
    attachment is null or jsonb_typeof(attachment) = 'object'
  )
);

create index if not exists discussion_messages_channel_created_idx
  on public.discussion_messages (channel_id, created_at);

alter table public.discussion_messages enable row level security;

grant select on public.discussion_messages to anon, authenticated;
grant insert on public.discussion_messages to authenticated;
grant update (body, attachment, is_hidden, updated_at) on public.discussion_messages to authenticated;

drop policy if exists "Discussion messages are publicly readable" on public.discussion_messages;
drop policy if exists "Members can create own discussion messages" on public.discussion_messages;
drop policy if exists "Members can edit own discussion messages" on public.discussion_messages;
drop policy if exists "Staff can moderate discussion messages" on public.discussion_messages;

create policy "Discussion messages are publicly readable"
  on public.discussion_messages
  for select
  using (is_hidden = false);

create policy "Members can create own discussion messages"
  on public.discussion_messages
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Members can edit own discussion messages"
  on public.discussion_messages
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Staff can moderate discussion messages"
  on public.discussion_messages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('owner', 'admin', 'moderator')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('owner', 'admin', 'moderator')
    )
  );
