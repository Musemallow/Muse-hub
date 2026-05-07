-- MuseHub initial Supabase schema.
-- Run this in the Supabase SQL editor after reviewing the values.

create type public.membership_tier as enum ('free', 'premium');
create type public.theme_mode as enum ('nox', 'sol');
create type public.profile_role as enum ('owner', 'moderator', 'member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text not null default '',
  status text not null default 'New signal detected.',
  social_handle text,
  avatar_url text not null default '/images/profile-avatar.svg',
  banner_url text not null default '/images/profile-banner-placeholder.svg',
  role public.profile_role not null default 'member',
  membership_tier public.membership_tier not null default 'free',
  theme_mode public.theme_mode not null default 'nox',
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_-]{3,32}$'),
  constraint display_name_length check (char_length(display_name) between 1 and 80),
  constraint status_length check (char_length(status) <= 160),
  constraint bio_length check (char_length(bio) <= 1000),
  constraint social_handle_length check (social_handle is null or char_length(social_handle) <= 80)
);

alter table public.profiles enable row level security;

revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (
  username,
  display_name,
  bio,
  status,
  social_handle,
  avatar_url,
  banner_url,
  theme_mode,
  updated_at
) on public.profiles to authenticated;

create policy "Profiles are readable by everyone"
  on public.profiles
  for select
  using (true);

create policy "Members can update their own editable profile fields"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    display_name,
    bio,
    status,
    social_handle,
    theme_mode
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'wanderer-' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', 'New Wanderer'),
    coalesce(new.raw_user_meta_data ->> 'bio', ''),
    coalesce(new.raw_user_meta_data ->> 'status', 'New signal detected.'),
    nullif(new.raw_user_meta_data ->> 'social_handle', ''),
    coalesce((new.raw_user_meta_data ->> 'theme_mode')::public.theme_mode, 'nox')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
