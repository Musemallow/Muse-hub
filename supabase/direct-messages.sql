-- MuseHub private direct messages.
-- Run this after supabase/schema.sql so members can DM one another.

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  attachment jsonb,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint direct_messages_not_self check (sender_id <> recipient_id),
  constraint direct_messages_body_length check (char_length(body) <= 2000),
  constraint direct_messages_has_content check (
    char_length(body) > 0 or attachment is not null
  ),
  constraint direct_messages_attachment_object check (
    attachment is null or jsonb_typeof(attachment) = 'object'
  )
);

create index if not exists direct_messages_sender_created_idx
  on public.direct_messages (sender_id, created_at);

create index if not exists direct_messages_recipient_created_idx
  on public.direct_messages (recipient_id, created_at);

alter table public.direct_messages enable row level security;

grant select on public.direct_messages to authenticated;
grant insert on public.direct_messages to authenticated;
grant update (body, attachment, is_hidden, updated_at) on public.direct_messages to authenticated;

drop policy if exists "Members can read their direct messages" on public.direct_messages;
drop policy if exists "Members can send direct messages" on public.direct_messages;
drop policy if exists "Members can edit own direct messages" on public.direct_messages;
drop policy if exists "Staff can moderate direct messages" on public.direct_messages;

create policy "Members can read their direct messages"
  on public.direct_messages
  for select
  to authenticated
  using (
    is_hidden = false
    and (auth.uid() = sender_id or auth.uid() = recipient_id)
  );

create policy "Members can send direct messages"
  on public.direct_messages
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "Members can edit own direct messages"
  on public.direct_messages
  for update
  to authenticated
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

create policy "Staff can moderate direct messages"
  on public.direct_messages
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
