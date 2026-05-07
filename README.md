# MuseHub

MuseHub is a Next.js creator/community prototype for MuseMallow. It currently uses mock data and browser-local storage while the app shell, profile system, discussions, store previews, and Nox/Sol theme modes are being shaped before the Supabase backend pass.

## Routes

- `/` - animated boot entrance screen
- `/hub` - main landing hub with latest posts, schedule preview, store drops, and latest channel preview
- `/events` - schedule page
- `/discussions` - Signal Rooms discussion prototype
- `/store` - external-link storefront preview
- `/profile` - owner profile and editable profile surface
- `/profile/[username]` - mock member profile pages
- `/profiles` - mock profile directory
- `/login` - login-first member access page
- `/join` - redirects to `/login`
- `/join/create` - frontend account creation/profile preview with validation checks
- `/feed` - owner/local post view kept for prototype tooling
- `/create` - owner-only local post composer with media previews

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

Draft and published post data are stored in the browser for local development. Supabase is not connected yet; `lib/supabase.ts` exposes a guarded client helper for the future backend pass.

## Supabase

The frontend auth forms read:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Initial database setup lives in `supabase/schema.sql`. Run it in the Supabase SQL editor before relying on real profile persistence or username uniqueness.
