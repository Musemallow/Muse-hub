-- MuseHub membership and authority levels.
-- Paid membership tiers are separate from staff authority.

alter type public.membership_tier add value if not exists 'tier_1';
alter type public.membership_tier add value if not exists 'tier_2';
alter type public.membership_tier add value if not exists 'tier_3';
alter type public.profile_role add value if not exists 'admin';

-- Optional examples:
-- Give a member moderator permissions:
-- update public.profiles set role = 'moderator', updated_at = now() where username = 'their_username';
--
-- Give a member admin permissions:
-- update public.profiles set role = 'admin', updated_at = now() where username = 'their_username';
--
-- Set a paid membership level:
-- update public.profiles set membership_tier = 'tier_1', updated_at = now() where username = 'their_username';
