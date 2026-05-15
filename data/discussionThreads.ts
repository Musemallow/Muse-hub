export type ChannelKind = "text" | "voice";
export type ChannelAttachment = "gif" | "image" | "voice";

export type MessageAttachment = {
  type: "gif" | "image";
  label: string;
  url: string;
};

export type ChannelMessage = {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string;
  authorRole: "owner" | "member" | "premium" | "moderator";
  createdAt: string;
  body: string;
  attachmentLabel?: string;
  attachment?: MessageAttachment;
};

export type DiscussionChannel = {
  id: string;
  name: string;
  symbol: string;
  purpose: string;
  description: string;
  kind: ChannelKind;
  isPremiumOnly?: boolean;
  isStaffOnly?: boolean;
  allowedAttachments: ChannelAttachment[];
  messages: ChannelMessage[];
};

export type DiscussionCategory = {
  id: string;
  name: string;
  symbol: string;
  channels: DiscussionChannel[];
};

const defaultTextAttachments: ChannelAttachment[] = ["gif", "image"];

export const discussionCategories: DiscussionCategory[] = [
  {
    id: "system-core",
    name: "System Core",
    symbol: "⟢",
    channels: [
      {
        id: "boot-sequence",
        name: "boot-sequence",
        symbol: "⟢",
        purpose: "First landing/info channel",
        description:
          "Signal initialization, server overview, and first contact instructions.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [
          {
            id: "boot-sequence-1",
            authorName: "MuseMallow",
            authorUsername: "musemallow",
            authorAvatarUrl: "/images/profile-avatar.png",
            authorRole: "owner",
            createdAt: "Pinned",
            body: "Welcome to The Forest. This is the first signal point for orientation and server context.",
          },
        ],
      },
      {
        id: "read-me",
        name: "read-me",
        symbol: "☾",
        purpose: "Rules + expectations",
        description:
          "Server rules, etiquette, and operational protocols for all Wanderers.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "announcements",
        name: "announcements",
        symbol: "✧",
        purpose: "Important updates",
        description:
          "Major updates, events, maintenance notices, and signal broadcasts.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [
          {
            id: "announcements-1",
            authorName: "MuseMallow",
            authorUsername: "musemallow",
            authorAvatarUrl: "/images/profile-avatar.png",
            authorRole: "owner",
            createdAt: "Current",
            body: "MuseHub now has creator-built signal rooms. Members can reply, but only I create the channels.",
          },
        ],
      },
      {
        id: "schedule-feed",
        name: "schedule-feed",
        symbol: "📡",
        purpose: "Stream/calendar updates",
        description:
          "Live schedules, cowork sessions, and upcoming transmissions.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
    ],
  },
  {
    id: "social-signals",
    name: "Social Signals",
    symbol: "⟢",
    channels: [
      {
        id: "general-chat",
        name: "general-chat",
        symbol: "🌲",
        purpose: "Main community chat",
        description:
          "General conversation, daily chatter, and casual signal traffic.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [
          {
            id: "general-chat-1",
            authorName: "Wanderer",
            authorUsername: "wanderer",
            authorAvatarUrl: "/images/profile-avatar.svg",
            authorRole: "member",
            createdAt: "2h ago",
            body: "The hub is starting to feel like a real community terminal.",
            attachmentLabel: "reaction.gif",
            attachment: {
              type: "gif",
              label: "reaction.gif",
              url: "data:image/gif;base64,R0lGODlhAQABAPAAAJYpKf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
            },
          },
        ],
      },
      {
        id: "campfire",
        name: "campfire",
        symbol: "☕",
        purpose: "Relaxed/off-topic space",
        description:
          "Slower conversations, life updates, and late-night forest vibes.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "now-playing",
        name: "now-playing",
        symbol: "🎧",
        purpose: "Media/music sharing",
        description:
          "Share music, playlists, videos, and current obsessions.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "signal-gallery",
        name: "signal-gallery",
        symbol: "🖼",
        purpose: "Art/media showcase",
        description:
          "Showcase artwork, edits, screenshots, designs, and visual anomalies.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "forest-polaroids",
        name: "forest-polaroids",
        symbol: "📸",
        purpose: "Personal images/aesthetic posting",
        description:
          "Photos, desk setups, pets, aesthetics, and fragments from reality.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
    ],
  },
  {
    id: "creator-network",
    name: "Creator Network",
    symbol: "⟢",
    channels: [
      {
        id: "creator-chat",
        name: "creator-chat",
        symbol: "✦",
        purpose: "Content creator discussion",
        description:
          "Streaming, VTubing, editing, branding, and creator conversations.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "growth-lab",
        name: "growth-lab",
        symbol: "📈",
        purpose: "Strategy + analytics",
        description:
          "Discuss growth tactics, engagement, metrics, and content systems.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "idea-vault",
        name: "idea-vault",
        symbol: "🧠",
        purpose: "Brainstorming space",
        description:
          "Store concepts, stream ideas, lore fragments, and future projects.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "content-reviews",
        name: "content-reviews",
        symbol: "🎬",
        purpose: "Feedback channel",
        description:
          "Share content for critique, improvement, and refinement.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "resource-cache",
        name: "resource-cache",
        symbol: "🛠",
        purpose: "Tools/assets/resources",
        description:
          "Useful software, overlays, guides, assets, and creator utilities.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
    ],
  },
  {
    id: "archives",
    name: "Archives",
    symbol: "⟢",
    channels: [
      {
        id: "resources",
        name: "resources",
        symbol: "📂",
        purpose: "Permanent useful info",
        description:
          "Important links, references, tutorials, and saved information.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "server-feedback",
        name: "server-feedback",
        symbol: "🛰",
        purpose: "Suggestions/improvements",
        description:
          "Report issues, suggest upgrades, and help evolve the network.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "mod-terminal",
        name: "mod-terminal",
        symbol: "🔒",
        purpose: "Staff coordination",
        description:
          "Moderator communication, logs, and internal operations.",
        kind: "text",
        isStaffOnly: true,
        allowedAttachments: [],
        messages: [],
      },
    ],
  },
];
