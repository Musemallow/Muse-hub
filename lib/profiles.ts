import { Profile, ThemeMode } from "../types/profile";
import { getSupabaseClient } from "./supabase";

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  status: string | null;
  social_handle: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  role: "owner" | "moderator" | "member";
  membership_tier: "free" | "premium";
  theme_mode: ThemeMode;
  points: number | null;
  created_at: string;
};

export async function getProfilesFromSupabase(): Promise<Profile[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, bio, status, social_handle, avatar_url, banner_url, role, membership_tier, theme_mode, points, created_at"
    )
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
    .select(
      "id, username, display_name, bio, status, social_handle, avatar_url, banner_url, role, membership_tier, theme_mode, points, created_at"
    )
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
    .select(
      "id, username, display_name, bio, status, social_handle, avatar_url, banner_url, role, membership_tier, theme_mode, points, created_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProfileRow(data) : null;
}

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    status: row.status ?? "New signal detected.",
    bio: row.bio ?? "",
    socialHandle: row.social_handle ?? "",
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
