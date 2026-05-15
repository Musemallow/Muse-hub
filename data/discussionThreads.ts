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
    id: "community",
    name: "Community",
    symbol: "#",
    channels: [
      {
        id: "general-chat",
        name: "General Chat",
        symbol: "#",
        purpose: "Main community chat",
        description: "General conversation, daily chatter, and casual community talk.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "questions",
        name: "Questions",
        symbol: "?",
        purpose: "Help and answers",
        description: "Ask questions about streams, posts, memberships, or how MuseHub works.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
      {
        id: "feedback",
        name: "Feedback",
        symbol: "!",
        purpose: "Suggestions and bug reports",
        description: "Share feedback, report issues, and suggest improvements for MuseHub.",
        kind: "text",
        allowedAttachments: defaultTextAttachments,
        messages: [],
      },
    ],
  },
];
