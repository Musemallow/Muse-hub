-- MuseHub profile media storage.
-- Run this in the Supabase SQL editor after supabase/schema.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'banners',
    'banners',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Profile media is publicly readable" on storage.objects;
drop policy if exists "Members can upload own profile media" on storage.objects;
drop policy if exists "Members can update own profile media" on storage.objects;
drop policy if exists "Members can delete own profile media" on storage.objects;

create policy "Profile media is publicly readable"
  on storage.objects
  for select
  using (bucket_id in ('avatars', 'banners'));

create policy "Members can upload own profile media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'banners')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Members can update own profile media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('avatars', 'banners')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('avatars', 'banners')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Members can delete own profile media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'banners')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
