# MuseHub

MuseHub is a Next.js creator/community platform for MuseMallow. It includes the boot entrance, creator hub, member profiles, discussions, external-link store listings, and Nox/Sol theme modes, with Supabase powering account and profile data.

## Routes

- `/` - animated boot entrance screen
- `/hub` - main landing hub with latest posts, schedule preview, store drops, and latest channel preview
- `/events` - schedule page
- `/discussions` - Signal Rooms discussions
- `/store` - external-link store listings
- `/profile` - logged-in member profile and editable profile surface
- `/profile/[username]` - public member profile pages
- `/profiles` - Supabase profile directory
- `/login` - login-first member access page
- `/join` - redirects to `/login`
- `/join/create` - account creation with validation checks
- `/feed` - redirects to `/hub#latest-posts`
- `/create` - owner-only post composer with media previews

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm run build
```

Draft post data is stored in the browser until the post database is connected. Supabase account and profile helpers live in `lib/supabase.ts` and `lib/profiles.ts`.

## Supabase

The frontend auth forms read:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Initial database setup lives in `supabase/schema.sql`. Run it in the Supabase SQL editor before relying on real profile persistence or username uniqueness.

After creating the owner account through `/join/create`, use `supabase/make-owner.sql` in the Supabase SQL editor to promote that account to `owner`.

Profile media buckets and upload policies live in `supabase/storage.sql`.
