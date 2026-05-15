import { notFound } from "next/navigation";
import ProfileView from "../../../components/profile/ProfileView";
import { getProfileByUsernameFromSupabase } from "../../../lib/profiles";
import { Profile } from "../../../types/profile";

type UserProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;
  const profile = await loadProfile(username);

  if (!profile) {
    notFound();
  }

  return <ProfileView profile={profile} />;
}

async function loadProfile(username: string) {
  try {
    return (
      (await getProfileByUsernameFromSupabase(username)) ??
      getFallbackChatProfile(username)
    );
  } catch {
    return getFallbackChatProfile(username);
  }
}

function getFallbackChatProfile(username: string): Profile | null {
  const cleanUsername = username.toLowerCase();
  const member = fallbackChatMembers[cleanUsername];

  if (!member) return null;

  return {
    id: `fallback-${cleanUsername}`,
    username: cleanUsername,
    displayName: member.displayName,
    status: member.status,
    bio: member.bio,
    avatarUrl: member.avatarUrl,
    bannerUrl: "/images/profile-banner-placeholder.svg",
    themeMode: "nox",
    points: member.points,
    role: member.role,
    isCreator: member.role === "owner",
    membership: {
      tier: member.tier,
      memberSince: "Alpha",
      cardId: `MH-${cleanUsername.toUpperCase()}`,
    },
    stats: {
      posts: member.posts,
      clips: member.clips,
      supporters: member.supporters,
      weeklyComments: 0,
    },
    schedule: [],
  };
}

const fallbackChatMembers: Record<
  string,
  {
    displayName: string;
    status: string;
    bio: string;
    avatarUrl: string;
    points: number;
    role: Profile["role"];
    tier: Profile["membership"]["tier"];
    posts: number;
    clips: number;
    supporters: number;
  }
> = {
  musemallow: {
    displayName: "MuseMallow",
    status: "Keeping the hub lights on.",
    bio: "Creator profile for the live chat roster and community rooms.",
    avatarUrl: "/images/profile-avatar.png",
    points: 1200,
    role: "owner",
    tier: "tier_3",
    posts: 18,
    clips: 9,
    supporters: 121,
  },
  denithris: {
    displayName: "Denithris",
    status: "Probably overthinking a room name.",
    bio: "Community chat member profile connected to the live rooms.",
    avatarUrl: "/images/profile-avatar.svg",
    points: 240,
    role: "member",
    tier: "tier_1",
    posts: 4,
    clips: 1,
    supporters: 12,
  },
  runewolffe: {
    displayName: "Rune Wolffe",
    status: "Awoo, respectfully.",
    bio: "Community chat member profile connected to the live rooms.",
    avatarUrl: "/images/profile-avatar.svg",
    points: 310,
    role: "member",
    tier: "tier_1",
    posts: 6,
    clips: 2,
    supporters: 16,
  },
  phantombones: {
    displayName: "Phantom Bones",
    status: "Lurking with intent.",
    bio: "Community chat member profile connected to the live rooms.",
    avatarUrl: "/images/profile-avatar.svg",
    points: 180,
    role: "member",
    tier: "free",
    posts: 2,
    clips: 0,
    supporters: 5,
  },
  ashelia: {
    displayName: "Ashelia",
    status: "Online in the forest.",
    bio: "Community chat member profile connected to the live rooms.",
    avatarUrl: "/images/profile-avatar.svg",
    points: 225,
    role: "member",
    tier: "tier_1",
    posts: 3,
    clips: 1,
    supporters: 10,
  },
  zerosic: {
    displayName: "ZeroSic",
    status: "Signal clear.",
    bio: "Community chat member profile connected to the live rooms.",
    avatarUrl: "/images/profile-avatar.svg",
    points: 195,
    role: "member",
    tier: "free",
    posts: 2,
    clips: 1,
    supporters: 7,
  },
  wanderer: {
    displayName: "Wanderer",
    status: "Passing through the hub.",
    bio: "Seeded chat profile connected to the live rooms.",
    avatarUrl: "/images/profile-avatar.svg",
    points: 80,
    role: "member",
    tier: "free",
    posts: 1,
    clips: 0,
    supporters: 2,
  },
};
