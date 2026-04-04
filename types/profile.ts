export type ThemeMode = "sol" | "nox";

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  status?: string;
  discordHandle?: string;
  themeMode: ThemeMode;
  points: number;
  isCreator: boolean;
};