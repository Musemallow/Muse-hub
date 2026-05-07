import { Profile } from "../types/profile";

export const mockProfile: Profile = {
  id: "muse-001",
  username: "musemallow",
  displayName: "MuseMallow",
  status: "Local forest spirit, definitely not a cryptid.",
  bio: "Cyber Grunge Forest Spirit VTuber. Streams, art, chaos, and whispered transmissions from somewhere deep in the woods. Welcome to The Forest.",
  socialHandle: "musemallow",
  avatarUrl: "/images/profile-avatar.svg",
  bannerUrl: "/images/musemallow-banner.jpeg",
  themeMode: "nox",
  points: 1460,
  isCreator: true,
  membership: {
    tier: "premium",
    memberSince: "April 2026",
    renewalDate: "May 30, 2026",
    cardId: "MUSE-001",
  },
  stats: {
    posts: 28,
    clips: 12,
    supporters: 146,
  },
  schedule: [
    {
      day: "Sunday",
      time: "8:00 PM CST",
      label: "Main Stream",
    },
    {
      day: "Monday",
      time: "8:00 PM CST",
      label: "Community / Variety",
    },
    {
      day: "Friday",
      time: "8:00 PM CST",
      label: "Spooky Night",
    },
  ],
};
