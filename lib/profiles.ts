import { Profile, SocialLinks, ThemeMode } from "../types/profile";
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
  role: "owner" | "moderator" | "member";
  membership_tier: "free" | "premium";
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

  return data ? mapProfileRow(data) : null;
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
        ? mapProfileRow({
            ...fallbackResult.data,
            social_links: {},
            birthdate: null,
            show_birthdate: false,
          })
        : null;
    }

    throw new Error(error.message);
  }

  return data ? mapProfileRow(data) : null;
}

export async function updateCurrentProfileInSupabase(profile: Profile) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
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
    })
    .eq("id", profile.id)
    .select(profileSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfileRow(data);
}

function mapProfileRow(row: ProfileRow): Profile {
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
    isCreator: row.role === "owner",
    membership: {
      tier: row.membership_tier ?? "free",
      memberSince: formatJoinDate(row.created_at),
      cardId: `${row.membership_tier === "premium" ? "SIGNAL" : "WANDER"}-${row.username.slice(0, 4).toUpperCase()}`,
    },
    stats: {
      posts: 0,
      clips: 0,
      supporters: 0,
    },
    schedule: [],
  };
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
