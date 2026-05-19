-- MuseHub live room messages.
-- Public room messages expire after four hours. Direct messages are stored separately
-- in supabase/direct-messages.sql and do not expire automatically.

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

create index if not exists discussion_messages_created_idx
  on public.discussion_messages (created_at);

do $$
begin
  alter publication supabase_realtime add table public.discussion_messages;
exception
  when duplicate_object then null;
end $$;

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

create or replace function public.delete_expired_discussion_messages()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.discussion_messages
  where created_at < now() - interval '4 hours';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Clean up immediately when this SQL is run.
select public.delete_expired_discussion_messages();

-- Supabase supports pg_cron on most projects. If cron is unavailable, the SQL
-- still succeeds and the app will hide expired public room messages.
do $$
begin
  create extension if not exists pg_cron with schema extensions;
exception
  when insufficient_privilege or undefined_file then null;
end $$;

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'cron')
    and not exists (
      select 1
      from cron.job
      where jobname = 'delete-expired-discussion-messages'
    )
  then
    perform cron.schedule(
      'delete-expired-discussion-messages',
      '*/15 * * * *',
      'select public.delete_expired_discussion_messages();'
    );
  end if;
exception
  when insufficient_privilege or invalid_schema_name or undefined_table then null;
end $$;
