-- Run this after creating your own MuseHub account.
-- Replace the email with the email you used on /join/create.

update public.profiles as profile
set
  role = 'owner',
  membership_tier = 'tier_3',
  updated_at = now()
from auth.users as auth_user
where profile.id = auth_user.id
  and auth_user.email = 'your-email@example.com';

-- Confirm the owner account:
select
  profile.username,
  profile.display_name,
  profile.role,
  profile.membership_tier
from public.profiles as profile
join auth.users as auth_user on auth_user.id = profile.id
where auth_user.email = 'your-email@example.com';
