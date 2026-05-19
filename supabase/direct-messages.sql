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

create table if not exists public.dm_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint dm_blocks_not_self check (blocker_id <> blocked_id)
);

create table if not exists public.dm_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '',
  message_ids jsonb not null default '[]'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  constraint dm_reports_not_self check (reporter_id <> reported_id),
  constraint dm_reports_reason_length check (char_length(reason) <= 2000),
  constraint dm_reports_message_ids_array check (jsonb_typeof(message_ids) = 'array')
);

create index if not exists dm_blocks_blocked_idx
  on public.dm_blocks (blocked_id, blocker_id);

create index if not exists dm_reports_reporter_created_idx
  on public.dm_reports (reporter_id, created_at desc);

create index if not exists dm_reports_reported_created_idx
  on public.dm_reports (reported_id, created_at desc);

do $$
begin
  alter publication supabase_realtime add table public.direct_messages;
exception
  when duplicate_object then null;
end $$;

alter table public.direct_messages enable row level security;
alter table public.dm_blocks enable row level security;
alter table public.dm_reports enable row level security;

grant select on public.direct_messages to authenticated;
grant insert on public.direct_messages to authenticated;
grant update (body, attachment, is_hidden, updated_at) on public.direct_messages to authenticated;
grant select, insert, delete on public.dm_blocks to authenticated;
grant select, insert, update on public.dm_reports to authenticated;

drop policy if exists "Members can read their direct messages" on public.direct_messages;
drop policy if exists "Members can send direct messages" on public.direct_messages;
drop policy if exists "Members can edit own direct messages" on public.direct_messages;
drop policy if exists "Staff can moderate direct messages" on public.direct_messages;
drop policy if exists "Members can read own DM blocks" on public.dm_blocks;
drop policy if exists "Members can block DM members" on public.dm_blocks;
drop policy if exists "Members can remove own DM blocks" on public.dm_blocks;
drop policy if exists "Members can create DM reports" on public.dm_reports;
drop policy if exists "Members can read own DM reports" on public.dm_reports;
drop policy if exists "Staff can read DM reports" on public.dm_reports;
drop policy if exists "Staff can update DM reports" on public.dm_reports;

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
  with check (
    auth.uid() = sender_id
    and not exists (
      select 1
      from public.dm_blocks
      where blocker_id = recipient_id
        and blocked_id = sender_id
    )
  );

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

create policy "Members can read own DM blocks"
  on public.dm_blocks
  for select
  to authenticated
  using (auth.uid() = blocker_id);

create policy "Members can block DM members"
  on public.dm_blocks
  for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create policy "Members can remove own DM blocks"
  on public.dm_blocks
  for delete
  to authenticated
  using (auth.uid() = blocker_id);

create policy "Members can create DM reports"
  on public.dm_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create policy "Members can read own DM reports"
  on public.dm_reports
  for select
  to authenticated
  using (auth.uid() = reporter_id);

create policy "Staff can read DM reports"
  on public.dm_reports
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('owner', 'admin', 'moderator')
    )
  );

create policy "Staff can update DM reports"
  on public.dm_reports
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
