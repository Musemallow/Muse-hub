# MuseHub Project Notes

MuseHub is MuseMallow's creator-centric community platform. It is a personal creator hub with Patreon-inspired memberships, creator updates, multimedia posts, member comments, profile identity, events, store drops, and eventual Supabase-backed production features.

## Product Direction

- Creator-centric: only MuseMallow can create posts or send platform messages.
- Members can comment, including comments with images, GIFs, and future voice notes.
- Premium membership is an identity/perk layer, not permission to post.
- Profiles should support avatars, banners, points, membership cards, QR cards, and theme preferences.
- Future app direction includes mobile-first polish, PWA support, push notifications, and app packaging.

## Visual Direction

- Cyber grunge / signal-infected forest.
- Jet black UI with electric blue highlights.
- Thin holographic/terminal-inspired UI.
- Glitch effects over smooth modern structure.
- Brand language: "Welcome to The Forest", "Definitely not a cryptid", "Anomaly Detected", "Wanderers".
- Motifs: deer, antlers, telephone poles, signal corruption, forest spirit imagery.
- Avoid green hues.
- Prefer electric blue over cyan.

## Current Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Local mock data and local draft storage
- Planned Supabase backend
- Planned Vercel deployment

## Planned Backend

- Supabase Auth
- Supabase Database
- Supabase Storage
- Supabase Realtime
- Push notifications later

## Core Data Areas

- Profiles/users
- Posts
- Comments
- Memberships
- Notifications
- Schedules/events
- Reactions/likes
- Store products
- Points/economy

## Roles And Permissions

- Owner: can post, manage content, and message.
- Moderator: future moderation tools.
- Member: can view allowed content and comment with media.
- Only owner can post.

## Recommended Build Order

1. Supabase setup
2. Auth implementation
3. Profile table and avatar/banner uploads
4. Real feed database
5. Comment system with media attachments
6. Membership permissions and locked content
7. Notifications
8. Storefront
9. Point economy
10. Mobile/PWA polish
11. Security pass

## Security Pass Requirements

- Auth validation
- RLS verification
- Upload restrictions
- Rate limiting
- XSS sanitization
- Permission boundaries
