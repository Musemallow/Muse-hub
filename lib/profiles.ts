import {
  MembershipTier,
  Profile,
  ProfileRole,
  SocialLinks,
  ThemeMode,
} from "../types/profile";
import { Json } from "../types/database";
import { getSupabaseClient } from "./supabase";

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  status: string | null;
  social_handle: string | null;
  social_links: Json;
  birthdate: string | null;
  show_birthdate: boolean | null;
  avatar_url: string | null;
  banner_url: string | null;
  role: ProfileRole;
  membership_tier: MembershipTier | "premium";
  theme_mode: ThemeMode;
  points: number | null;
  created_at: string;
};

const profileSelect =
  "id, username, display_name, bio, status, social_handle, social_links, birthdate, show_birthdate, avatar_url, banner_url, role, membership_tier, theme_mode, points, created_at";
const fallbackProfileSelect =
  "id, username, display_name, bio, status, social_handle, avatar_url, banner_url, role, membership_tier, theme_mode, points, created_at";

export async function getProfilesFromSupabase(): Promise<Profile[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProfileRow);
}

export async function getProfileByUsernameFromSupabase(username: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? enrichProfileActivity(await mapProfileRow(data)) : null;
}

export async function getCurrentProfileFromSupabase() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    if (
      error.message.includes("schema cache") ||
      error.message.includes("social_links") ||
      error.message.includes("birthdate") ||
      error.message.includes("show_birthdate")
    ) {
      const fallbackResult = await supabase
        .from("profiles")
        .select(fallbackProfileSelect)
        .eq("id", user.id)
        .maybeSingle();

      if (fallbackResult.error) {
        throw new Error(fallbackResult.error.message);
      }

      return fallbackResult.data
        ? enrichProfileActivity(await mapProfileRow({
            ...fallbackResult.data,
            social_links: {},
            birthdate: null,
            show_birthdate: false,
          }))
        : null;
    }

    throw new Error(error.message);
  }

  return data ? enrichProfileActivity(await mapProfileRow(data)) : null;
}

export async function updateCurrentProfileInSupabase(profile: Profile) {
  const supabase = getSupabaseClient();

  const editableProfile = {
    username: profile.username,
    display_name: profile.displayName,
    bio: profile.bio,
    status: profile.status,
    social_handle: profile.socialHandle ?? "",
    social_links: profile.socialLinks ?? {},
    birthdate: profile.birthdate || null,
    show_birthdate: Boolean(profile.showBirthdate),
    avatar_url: profile.avatarUrl,
    banner_url: profile.bannerUrl,
    theme_mode: profile.themeMode,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(editableProfile)
    .eq("id", profile.id)
    .select(profileSelect)
    .single();

  if (error) {
    if (shouldRetryProfileUpdate(error.message)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("profiles")
        .update({
          username: editableProfile.username,
          display_name: editableProfile.display_name,
          bio: editableProfile.bio,
          status: editableProfile.status,
          social_handle: editableProfile.social_handle,
          avatar_url: editableProfile.avatar_url,
          banner_url: editableProfile.banner_url,
          theme_mode: editableProfile.theme_mode,
        })
        .eq("id", profile.id)
        .select(fallbackProfileSelect)
        .single();

      if (fallbackError) {
        throw new Error(getProfileSaveError(fallbackError.message));
      }

      return mapProfileRow({
        ...(fallbackData as ProfileRow),
        social_links: profile.socialLinks ?? {},
        birthdate: profile.birthdate || null,
        show_birthdate: Boolean(profile.showBirthdate),
      });
    }

    throw new Error(getProfileSaveError(error.message));
  }

  return mapProfileRow(data);
}

async function enrichProfileActivity(profile: Profile) {
  try {
    const supabase = getSupabaseClient();
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { count } = await supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("created_at", since.toISOString());

    return {
      ...profile,
      stats: {
        ...profile.stats,
        weeklyComments: count ?? 0,
      },
    };
  } catch {
    return profile;
  }
}

function shouldRetryProfileUpdate(message: string) {
  return (
    message.includes("schema cache") ||
    message.includes("social_links") ||
    message.includes("birthdate") ||
    message.includes("show_birthdate") ||
    message.includes("updated_at")
  );
}

function getProfileSaveError(message: string) {
  if (message.includes("permission denied")) {
    return "Supabase blocked this profile update. Run security-hardening.sql so members can update their own editable profile fields.";
  }

  if (message.includes("violates row-level security")) {
    return "Supabase blocked this profile update with row-level security. Make sure you are logged in and run security-hardening.sql.";
  }

  if (
    message.includes("schema cache") ||
    message.includes("social_links") ||
    message.includes("birthdate") ||
    message.includes("show_birthdate") ||
    message.includes("updated_at")
  ) {
    return "The live database is missing the latest profile columns. Run security-hardening.sql in Supabase, then refresh MuseHub.";
  }

  return message;
}

function mapProfileRow(row: ProfileRow): Profile {
  const membershipTier = normalizeMembershipTier(row.membership_tier);

  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    status: row.status ?? "New signal detected.",
    bio: row.bio ?? "",
    socialHandle: row.social_handle ?? "",
    socialLinks: parseSocialLinks(row.social_links),
    birthdate: row.birthdate ?? "",
    showBirthdate: Boolean(row.show_birthdate),
    avatarUrl: row.avatar_url ?? "/images/profile-avatar.svg",
    bannerUrl: row.banner_url ?? "/images/profile-banner-placeholder.svg",
    themeMode: row.theme_mode ?? "nox",
    points: row.points ?? 0,
    role: row.role,
    isCreator: row.role === "owner",
    membership: {
      tier: membershipTier,
      memberSince: formatJoinDate(row.created_at),
      cardId: `${getMembershipCardPrefix(membershipTier)}-${row.username.slice(0, 4).toUpperCase()}`,
    },
    stats: {
      posts: 0,
      clips: 0,
      supporters: 0,
      weeklyComments: 0,
    },
    schedule: [],
  };
}

function normalizeMembershipTier(tier: MembershipTier | "premium") {
  if (tier === "premium") return "tier_3";
  return tier ?? "free";
}

function getMembershipCardPrefix(tier: MembershipTier) {
  if (tier === "tier_3") return "ANOMALY";
  if (tier === "tier_2") return "SIGNAL";
  if (tier === "tier_1") return "SYNC";
  return "WANDER";
}

function formatJoinDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function parseSocialLinks(value: Json): SocialLinks {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return {
    twitch: getStringField(value, "twitch"),
    x: getStringField(value, "x"),
    bsky: getStringField(value, "bsky"),
    instagram: getStringField(value, "instagram"),
    youtube: getStringField(value, "youtube"),
    discord: getStringField(value, "discord"),
  };
}

function getStringField(
  value: { [key: string]: Json | undefined },
  key: string
) {
  const field = value[key];
  return typeof field === "string" ? field : "";
}
