import { Profile } from "../types/profile";
import { mockProfile } from "./mockProfile";

export const mockProfiles: Profile[] = [
  mockProfile,
  {
    id: "wanderer-001",
    username: "wanderer",
    displayName: "Wanderer",
    status: "Listening for strange signals from the edge of The Forest.",
    bio: "Member profile prototype for community accounts. This user can reply in signal rooms, comment with media, earn points, and hold a membership card.",
    socialHandle: "wanderer",
    avatarUrl: "/images/profile-avatar.svg",
    bannerUrl: "/images/profile-banner-placeholder.svg",
    themeMode: "nox",
    points: 320,
    isCreator: false,
    membership: {
      tier: "free",
      memberSince: "May 2026",
      cardId: "WANDER-001",
    },
    stats: {
      posts: 0,
      clips: 0,
      supporters: 0,
    },
    schedule: [],
  },
  {
    id: "supporter-001",
    username: "signalkeeper",
    displayName: "SignalKeeper",
    status: "Premium wanderer cataloging anomalies.",
    bio: "Premium member profile prototype for supporter access, profile identity, points, and future unlockables.",
    socialHandle: "signalkeeper",
    avatarUrl: "/images/profile-avatar.svg",
    bannerUrl: "/images/profile-banner-placeholder.svg",
    themeMode: "nox",
    points: 940,
    isCreator: false,
    membership: {
      tier: "premium",
      memberSince: "May 2026",
      renewalDate: "June 6, 2026",
      cardId: "SIGNAL-001",
    },
    stats: {
      posts: 0,
      clips: 0,
      supporters: 0,
    },
    schedule: [],
  },
];

export function getProfileByUsername(username: string) {
  return mockProfiles.find(
    (profile) => profile.username.toLowerCase() === username.toLowerCase()
  );
}
