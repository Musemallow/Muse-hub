export type ThemeMode = "sol" | "nox";

export type MembershipTier = "free" | "premium";

export type Membership = {
  tier: MembershipTier;
  memberSince: string;
  renewalDate?: string;
  cardId: string;
};

export type ProfilePermissions = {
  canPost: boolean;
  canMessage: boolean;
  canComment: boolean;
  canCommentWithImages: boolean;
  canCommentWithGifs: boolean;
};

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  status: string;
  bio: string;
  socialHandle?: string;
  avatarUrl: string;
  bannerUrl: string;
  themeMode: ThemeMode;
  points: number;
  isCreator: boolean;
  membership: Membership;
  stats: {
    posts: number;
    clips: number;
    supporters: number;
  };
  schedule: {
    day: string;
    time: string;
    label: string;
  }[];
};
