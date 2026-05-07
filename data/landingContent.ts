export type LandingUpdate = {
  id: string;
  label: string;
  title: string;
  date: string;
  summary: string;
  href: string;
};

export type StoreDrop = {
  id: string;
  title: string;
  status: string;
  price: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
};

export const landingUpdates: LandingUpdate[] = [
  {
    id: "profile-cards",
    label: "Profile",
    title: "Premium membership cards are being shaped now",
    date: "Current build",
    summary:
      "Profiles now separate premium status from creator permissions, with comment access ready for GIFs and images.",
    href: "/profile",
  },
  {
    id: "media-comments",
    label: "Community",
    title: "Member comments can support images and GIFs",
    date: "In progress",
    summary:
      "Members can comment on posts, while posting and messaging stay locked to MuseMallow.",
    href: "/hub#latest-posts",
  },
  {
    id: "creator-feed",
    label: "Post",
    title: "Creator posts are the center of the main feed",
    date: "Live preview",
    summary:
      "The feed is set up for creator-owned posts, local drafts, and media-rich updates.",
    href: "/hub#latest-posts",
  },
];

export const storeDrops: StoreDrop[] = [
  {
    id: "forest-pass",
    title: "Forest Pass",
    status: "Concept",
    price: "Premium perk",
    imageUrl: "/images/musemallow-banner.jpeg",
    externalUrl: "https://twitch.tv/musemallow",
    description:
      "A premium identity item tied to member cards, seasonal access, and future supporter rewards.",
  },
  {
    id: "digital-pack",
    title: "Signal Pack Vol. 1",
    status: "Coming soon",
    price: "TBD",
    imageUrl: "/images/store-placeholder.svg",
    externalUrl: "https://twitch.tv/musemallow",
    description:
      "A small digital pack for profile flair, wallpapers, and stream-themed extras.",
  },
  {
    id: "sticker-drop",
    title: "MuseMallow Sticker Drop",
    status: "Planned",
    price: "TBD",
    imageUrl: "/images/store-placeholder.svg",
    externalUrl: "https://twitch.tv/musemallow",
    description:
      "A future store item for expressive comments, community posts, and profile decoration.",
  },
];

export const upcomingEvents: EventItem[] = [
  {
    id: "main-stream",
    title: "Main Stream",
    date: "Sunday",
    time: "8:00 PM CST",
    location: "The Forest",
  },
  {
    id: "community-night",
    title: "Community / Variety",
    date: "Monday",
    time: "8:00 PM CST",
    location: "Member chat",
  },
  {
    id: "spooky-night",
    title: "Spooky Night",
    date: "Friday",
    time: "8:00 PM CST",
    location: "Live broadcast",
  },
];
