-- MuseHub profile permission hardening.
-- Run this after supabase/schema.sql if your project was created before this file existed.

drop policy if exists "Members can create their own profile" on public.profiles;
drop policy if exists "Members can update their own profile" on public.profiles;
drop policy if exists "Members can update their own editable profile fields" on public.profiles;

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

alter table public.profiles
  drop constraint if exists display_name_length,
  add constraint display_name_length check (char_length(display_name) between 1 and 80);

alter table public.profiles
  drop constraint if exists status_length,
  add constraint status_length check (char_length(status) <= 160);

alter table public.profiles
  drop constraint if exists bio_length,
  add constraint bio_length check (char_length(bio) <= 1000);

alter table public.profiles
  drop constraint if exists social_handle_length,
  add constraint social_handle_length check (social_handle is null or char_length(social_handle) <= 80);

create policy "Members can update their own editable profile fields"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
