export type ThemeMode = "sol" | "nox";

export type MembershipTier = "free" | "tier_1" | "tier_2" | "tier_3";
export type ProfileRole = "owner" | "admin" | "moderator" | "member";

export type Membership = {
  tier: MembershipTier;
  memberSince: string;
  renewalDate?: string;
  cardId: string;
};

export type SocialLinks = {
  twitch?: string;
  x?: string;
  bsky?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
};

export type ProfilePermissions = {
  canPost: boolean;
  canMessage: boolean;
  canComment: boolean;
  canCommentWithImages: boolean;
  canCommentWithGifs: boolean;
  canModerate: boolean;
};

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  status: string;
  bio: string;
  socialHandle?: string;
  socialLinks?: SocialLinks;
  birthdate?: string;
  showBirthdate?: boolean;
  avatarUrl: string;
  bannerUrl: string;
  themeMode: ThemeMode;
  points: number;
  role: ProfileRole;
  isCreator: boolean;
  membership: Membership;
  stats: {
    posts: number;
    clips: number;
    supporters: number;
    weeklyComments: number;
  };
  schedule: {
    day: string;
    time: string;
    label: string;
  }[];
};
