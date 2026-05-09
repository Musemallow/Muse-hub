-- MuseHub owner-editable site content.
-- Run this after profiles exist and your owner account is promoted.

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_content_object check (jsonb_typeof(content) = 'object')
);

alter table public.site_content enable row level security;

grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;

drop policy if exists "Site content is publicly readable" on public.site_content;
drop policy if exists "Owner can create site content" on public.site_content;
drop policy if exists "Owner can update site content" on public.site_content;

create policy "Site content is publicly readable"
  on public.site_content
  for select
  using (true);

create policy "Owner can create site content"
  on public.site_content
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

create policy "Owner can update site content"
  on public.site_content
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

insert into public.site_content (id, content)
values (
  'main',
  '{
    "hero": {
      "bannerUrl": "/images/musemallow-banner.jpeg",
      "eyebrow": "Welcome to The Forest",
      "title": "MuseMallow",
      "body": "Current posts, store drops, schedule notes, and member access for the MuseHub community.",
      "primaryButtonText": "Latest Posts",
      "secondaryButtonText": "Schedule",
      "storeButtonText": "Store Drops"
    },
    "stats": {
      "memberLabel": "Member",
      "memberValue": "Anomaly",
      "pointsLabel": "Points",
      "pointsValue": "1460",
      "nextEventLabel": "Next Event",
      "nextEventValue": "Sunday / 8 PM"
    },
    "sections": {
      "postsEyebrow": "Posts",
      "postsTitle": "Latest From MuseMallow",
      "scheduleEyebrow": "Schedule",
      "scheduleTitle": "Coming Up",
      "storeEyebrow": "Store",
      "storeTitle": "Drops And Perks"
    },
    "events": [
      {
        "id": "main-stream",
        "title": "Main Stream",
        "date": "Sunday",
        "time": "8:00 PM CST",
        "location": "The Forest"
      },
      {
        "id": "community-night",
        "title": "Community / Variety",
        "date": "Monday",
        "time": "8:00 PM CST",
        "location": "Member chat"
      },
      {
        "id": "spooky-night",
        "title": "Spooky Night",
        "date": "Friday",
        "time": "8:00 PM CST",
        "location": "Live broadcast"
      }
    ],
    "storeDrops": [
      {
        "id": "forest-pass",
        "title": "Forest Pass",
        "status": "Concept",
        "price": "Anomaly perk",
        "imageUrl": "/images/musemallow-banner.jpeg",
        "externalUrl": "https://twitch.tv/musemallow",
        "description": "A paid identity item tied to member cards, seasonal access, and future supporter rewards."
      },
      {
        "id": "digital-pack",
        "title": "Signal Pack Vol. 1",
        "status": "Coming soon",
        "price": "TBD",
        "imageUrl": "/images/store-placeholder.svg",
        "externalUrl": "https://twitch.tv/musemallow",
        "description": "A small digital pack for profile flair, wallpapers, and stream-themed extras."
      },
      {
        "id": "sticker-drop",
        "title": "MuseMallow Sticker Drop",
        "status": "Planned",
        "price": "TBD",
        "imageUrl": "/images/store-placeholder.svg",
        "externalUrl": "https://twitch.tv/musemallow",
        "description": "A future store item for expressive comments, community posts, and profile decoration."
      }
    ]
  }'::jsonb
)
on conflict (id) do nothing;
