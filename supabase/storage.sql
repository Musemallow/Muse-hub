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
  ),
  (
    'post-media',
    'post-media',
    true,
    209715200,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/webm',
      'audio/ogg'
    ]
  ),
  (
    'chat-attachments',
    'chat-attachments',
    true,
    10485760,
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
drop policy if exists "Owner can upload post media" on storage.objects;
drop policy if exists "Owner can update post media" on storage.objects;
drop policy if exists "Owner can delete post media" on storage.objects;
drop policy if exists "Members can upload chat attachments" on storage.objects;
drop policy if exists "Members can update own chat attachments" on storage.objects;
drop policy if exists "Members can delete own chat attachments" on storage.objects;

create policy "Profile media is publicly readable"
  on storage.objects
  for select
  using (bucket_id in ('avatars', 'banners', 'post-media', 'chat-attachments'));

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

create policy "Owner can upload post media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'post-media'
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'owner'
    )
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owner can update post media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'post-media'
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'owner'
    )
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'post-media'
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'owner'
    )
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owner can delete post media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'post-media'
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'owner'
    )
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Members can upload chat attachments"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and auth.role() = 'authenticated'
  );

create policy "Members can update own chat attachments"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Members can delete own chat attachments"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
