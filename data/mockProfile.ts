export type ProfileData = {
  username: string;
  displayName: string;
  status: string;
  bio: string;
  discord?: string;
  avatarUrl: string;
  bannerUrl: string;
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

export const mockProfile: ProfileData = {
  username: "musemallow",
  displayName: "MuseMallow",
  status: "Local forest spirit, definitely not a cryptid.",
  bio: "Cyber Grunge Forest Spirit VTuber. Streams, art, chaos, and whispered transmissions from somewhere deep in the woods. Welcome to The Forest.",
  discord: "musemallow",
  avatarUrl: "/images/profile-avatar.png",
  bannerUrl: "/images/profile-banner.png",
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