-- MuseHub alpha content and economy core.
-- Run after schema.sql, security-hardening.sql, and storage.sql.

do $$
begin
  create type public.post_visibility as enum ('public', 'members', 'premium');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.post_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.reaction_type as enum ('like');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.point_event_type as enum (
    'daily_checkin',
    'comment_created',
    'reaction_created',
    'admin_adjustment'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  media jsonb not null default '[]'::jsonb,
  visibility public.post_visibility not null default 'public',
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_title_length check (char_length(title) <= 140),
  constraint post_content_length check (char_length(content) <= 12000),
  constraint post_media_is_array check (jsonb_typeof(media) = 'array')
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comment_content_length check (char_length(content) <= 2000),
  constraint comment_has_content_or_attachment check (
    char_length(trim(content)) > 0
    or jsonb_array_length(attachments) > 0
  ),
  constraint comment_attachments_is_array check (jsonb_typeof(attachments) = 'array')
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.reaction_type not null default 'like',
  created_at timestamptz not null default now(),
  unique (post_id, user_id, type)
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type public.point_event_type not null,
  points integer not null,
  source_table text,
  source_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint points_ledger_non_zero check (points <> 0),
  constraint points_metadata_is_object check (jsonb_typeof(metadata) = 'object'),
  unique (user_id, event_type, source_table, source_id)
);

create index if not exists posts_published_idx
  on public.posts (status, published_at desc, created_at desc);

create index if not exists comments_user_created_idx
  on public.comments (user_id, created_at desc);

create index if not exists comments_post_created_idx
  on public.comments (post_id, created_at asc);

create index if not exists points_ledger_user_created_idx
  on public.points_ledger (user_id, created_at desc);

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.points_ledger enable row level security;

revoke insert, update, delete on public.posts from anon, authenticated;
revoke insert, update, delete on public.comments from anon, authenticated;
revoke insert, update, delete on public.reactions from anon, authenticated;
revoke insert, update, delete on public.points_ledger from anon, authenticated;

grant select on public.posts to anon, authenticated;
grant select on public.comments to anon, authenticated;
grant select on public.reactions to anon, authenticated;
grant select on public.points_ledger to authenticated;

grant insert, update, delete on public.posts to authenticated;
grant insert, update, delete on public.comments to authenticated;
grant insert, delete on public.reactions to authenticated;

create or replace function public.is_owner(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'owner'
  );
$$;

create or replace function public.can_view_post(target_post public.posts)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_post.status = 'published'
    and (
      target_post.visibility = 'public'
      or (
        target_post.visibility = 'members'
        and auth.uid() is not null
      )
      or (
        target_post.visibility = 'premium'
        and auth.uid() is not null
        and exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and membership_tier = 'premium'
        )
      )
    );
$$;

drop policy if exists "Published posts are visible by access level" on public.posts;
drop policy if exists "Owner can manage posts" on public.posts;
drop policy if exists "Visible comments are readable with visible posts" on public.comments;
drop policy if exists "Members can create comments on visible posts" on public.comments;
drop policy if exists "Members can update own comments" on public.comments;
drop policy if exists "Members can delete own comments" on public.comments;
drop policy if exists "Visible reactions are readable with visible posts" on public.reactions;
drop policy if exists "Members can like visible posts" on public.reactions;
drop policy if exists "Members can remove own reactions" on public.reactions;
drop policy if exists "Members can read own points ledger" on public.points_ledger;
drop policy if exists "Owner can read all points ledger" on public.points_ledger;

create policy "Published posts are visible by access level"
  on public.posts
  for select
  using (public.can_view_post(posts));

create policy "Owner can manage posts"
  on public.posts
  for all
  to authenticated
  using (public.is_owner(auth.uid()))
  with check (public.is_owner(auth.uid()));

create policy "Visible comments are readable with visible posts"
  on public.comments
  for select
  using (
    not is_hidden
    and exists (
      select 1
      from public.posts
      where posts.id = comments.post_id
        and public.can_view_post(posts)
    )
  );

create policy "Members can create comments on visible posts"
  on public.comments
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and char_length(content) <= 2000
    and exists (
      select 1
      from public.posts
      where posts.id = comments.post_id
        and public.can_view_post(posts)
    )
  );

create policy "Members can update own comments"
  on public.comments
  for update
  to authenticated
  using (auth.uid() = user_id and not is_hidden)
  with check (auth.uid() = user_id and not is_hidden);

create policy "Members can delete own comments"
  on public.comments
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Visible reactions are readable with visible posts"
  on public.reactions
  for select
  using (
    exists (
      select 1
      from public.posts
      where posts.id = reactions.post_id
        and public.can_view_post(posts)
    )
  );

create policy "Members can like visible posts"
  on public.reactions
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.posts
      where posts.id = reactions.post_id
        and public.can_view_post(posts)
    )
  );

create policy "Members can remove own reactions"
  on public.reactions
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Members can read own points ledger"
  on public.points_ledger
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Owner can read all points ledger"
  on public.points_ledger
  for select
  to authenticated
  using (public.is_owner(auth.uid()));

create or replace function public.award_points(
  target_user_id uuid,
  target_event_type public.point_event_type,
  target_points integer,
  target_source_table text default null,
  target_source_id uuid default null,
  target_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_points = 0 then
    return;
  end if;

  insert into public.points_ledger (
    user_id,
    event_type,
    points,
    source_table,
    source_id,
    metadata
  )
  values (
    target_user_id,
    target_event_type,
    target_points,
    target_source_table,
    target_source_id,
    coalesce(target_metadata, '{}'::jsonb)
  )
  on conflict (user_id, event_type, source_table, source_id) do nothing;

  update public.profiles
  set points = coalesce((
    select sum(points)
    from public.points_ledger
    where user_id = target_user_id
  ), 0)
  where id = target_user_id;
end;
$$;

create or replace function public.award_comment_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.award_points(
    new.user_id,
    'comment_created',
    2,
    'comments',
    new.id,
    jsonb_build_object('post_id', new.post_id)
  );

  return new;
end;
$$;

create or replace function public.award_reaction_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.award_points(
    new.user_id,
    'reaction_created',
    1,
    'reactions',
    new.id,
    jsonb_build_object('post_id', new.post_id, 'type', new.type)
  );

  return new;
end;
$$;

drop trigger if exists on_comment_award_points on public.comments;
create trigger on_comment_award_points
  after insert on public.comments
  for each row execute function public.award_comment_points();

drop trigger if exists on_reaction_award_points on public.reactions;
create trigger on_reaction_award_points
  after insert on public.reactions
  for each row execute function public.award_reaction_points();

create or replace function public.claim_daily_checkin()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  awarded_points integer := 10;
  today_source uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  today_source := md5(auth.uid()::text || current_date::text)::uuid;

  perform public.award_points(
    auth.uid(),
    'daily_checkin',
    awarded_points,
    'daily_checkins',
    today_source,
    jsonb_build_object('date', current_date)
  );

  return awarded_points;
end;
$$;

grant execute on function public.claim_daily_checkin() to authenticated;
