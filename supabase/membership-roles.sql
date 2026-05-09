-- MuseHub membership and authority levels.
-- Membership tiers are Patreon-linked access levels:
-- free = Wanderer
-- tier_1 = Witness
-- tier_2 = Signal Infected
-- tier_3 = Anomaly
--
-- Authority roles are site permissions:
-- member, moderator, admin, owner
--
-- Run each alter type statement separately in Supabase if your dashboard
-- complains that a new enum value cannot be used in the same transaction.

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
-- Manually approve Patreon-linked membership levels:
-- update public.profiles set membership_tier = 'tier_1', updated_at = now() where username = 'their_username';
-- update public.profiles set membership_tier = 'tier_2', updated_at = now() where username = 'their_username';
-- update public.profiles set membership_tier = 'tier_3', updated_at = now() where username = 'their_username';
--
-- Return someone to the free Wanderer tier:
-- update public.profiles set membership_tier = 'free', updated_at = now() where username = 'their_username';
