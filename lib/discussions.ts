import { ChannelMessage, discussionCategories } from "../data/discussionThreads";
import { Json } from "../types/database";
import { Profile } from "../types/profile";
import { createNotification } from "./notifications";
import { getProfilesFromSupabase } from "./profiles";
import { getSupabaseClient } from "./supabase";

type DiscussionMessageRow = {
  id: string;
  channel_id: string;
  user_id: string;
  body: string;
  attachment: Json;
  created_at: string;
  profiles:
    | {
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
        role: Profile["role"] | null;
        membership_tier: Profile["membership"]["tier"] | "premium" | null;
      }
    | null;
};

const DISCUSSION_MESSAGE_TTL_HOURS = 4;

export function getSeedDiscussionMessages() {
  return Object.fromEntries(
    discussionCategories
      .flatMap((category) => category.channels)
      .map((channel) => [channel.id, channel.messages])
  );
}

export async function getDiscussionMessages(channelIds: string[]) {
  if (channelIds.length === 0) return getSeedDiscussionMessages();

  try {
    const supabase = getSupabaseClient();
    const visibleAfter = new Date(
      Date.now() - DISCUSSION_MESSAGE_TTL_HOURS * 60 * 60 * 1000
    ).toISOString();
    const { data, error } = await supabase
      .from("discussion_messages")
      .select(
        "id, channel_id, user_id, body, attachment, created_at, profiles(username, display_name, avatar_url, role, membership_tier)"
      )
      .in("channel_id", channelIds)
      .eq("is_hidden", false)
      .gte("created_at", visibleAfter)
      .order("created_at", { ascending: true });

    if (error) {
      return getSeedDiscussionMessages();
    }

    const seededMessages = getSeedDiscussionMessages();
    const messagesByChannel: Record<string, ChannelMessage[]> = Object.fromEntries(
      channelIds.map((channelId) => [channelId, seededMessages[channelId] ?? []])
    );

    (data as DiscussionMessageRow[] | null)?.forEach((row) => {
      messagesByChannel[row.channel_id] = [
        ...(messagesByChannel[row.channel_id] ?? []),
        mapDiscussionMessageRow(row),
      ];
    });

    return messagesByChannel;
  } catch {
    return getSeedDiscussionMessages();
  }
}

export async function createDiscussionMessage({
  channelId,
  profile,
  body,
  attachment,
}: {
  channelId: string;
  profile: Profile;
  body: string;
  attachment?: ChannelMessage["attachment"];
}) {
  const optimisticMessage = createLocalDiscussionMessage({
    channelId,
    profile,
    body,
    attachment,
  });

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("discussion_messages")
      .insert({
        channel_id: channelId,
        user_id: profile.id,
        body,
        attachment: attachment ?? null,
      })
      .select(
        "id, channel_id, user_id, body, attachment, created_at, profiles(username, display_name, avatar_url, role, membership_tier)"
      )
      .single();

    if (error || !data) {
      return optimisticMessage;
    }

    await notifyMentionedMembers({
      actor: profile,
      body,
      channelId,
    });

    return mapDiscussionMessageRow(data as DiscussionMessageRow);
  } catch {
    return optimisticMessage;
  }
}

async function notifyMentionedMembers({
  actor,
  body,
  channelId,
}: {
  actor: Profile;
  body: string;
  channelId: string;
}) {
  const mentionedUsernames = Array.from(
    new Set(
      [...body.matchAll(/@([a-z0-9_-]{3,32})/gi)].map((match) =>
        match[1].toLowerCase()
      )
    )
  );

  if (mentionedUsernames.length === 0) return;

  try {
    const profiles = await getProfilesFromSupabase();
    const recipients = profiles.filter(
      (profile) =>
        profile.id !== actor.id &&
        mentionedUsernames.includes(profile.username.toLowerCase())
    );

    await Promise.all(
      recipients.map((recipient) =>
        createNotification({
          userId: recipient.id,
          actorId: actor.id,
          type: "discussion_mention",
          title: `${actor.displayName} mentioned you`,
          body,
          href: "/discussions",
          metadata: { channelId, actorUsername: actor.username },
        })
      )
    );
  } catch {
    return;
  }
}

export function createLocalDiscussionMessage({
  channelId,
  profile,
  body,
  attachment,
}: {
  channelId: string;
  profile: Profile;
  body: string;
  attachment?: ChannelMessage["attachment"];
}): ChannelMessage {
  return {
    id: `${channelId}-${Date.now()}`,
    authorName: profile.displayName,
    authorUsername: profile.username,
    authorAvatarUrl: profile.avatarUrl || "/images/profile-avatar.svg",
    authorRole: getDiscussionRole(profile),
    createdAt: "Just now",
    body,
    attachmentLabel: attachment?.label,
    attachment,
  };
}

function mapDiscussionMessageRow(row: DiscussionMessageRow): ChannelMessage {
  const profile = row.profiles;
  const attachment = parseAttachment(row.attachment);

  return {
    id: row.id,
    authorName: profile?.display_name || "Wanderer",
    authorUsername: profile?.username || "wanderer",
    authorAvatarUrl: profile?.avatar_url || "/images/profile-avatar.svg",
    authorRole: getRowDiscussionRole(profile),
    createdAt: formatMessageTime(row.created_at),
    body: row.body,
    attachmentLabel: attachment?.label,
    attachment,
  };
}

function parseAttachment(value: Json): ChannelMessage["attachment"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const type = value.type;
  const label = value.label;
  const url = value.url;

  if (
    (type === "gif" || type === "image") &&
    typeof label === "string" &&
    typeof url === "string"
  ) {
    return { type, label, url };
  }

  return undefined;
}

function getDiscussionRole(profile: Profile): ChannelMessage["authorRole"] {
  if (profile.isCreator || profile.role === "owner") return "owner";
  if (profile.role === "admin" || profile.role === "moderator") return "moderator";
  if (profile.membership.tier !== "free") return "premium";
  return "member";
}

function getRowDiscussionRole(
  profile: DiscussionMessageRow["profiles"]
): ChannelMessage["authorRole"] {
  if (profile?.role === "owner") return "owner";
  if (profile?.role === "admin" || profile?.role === "moderator") return "moderator";
  if (profile?.membership_tier && profile.membership_tier !== "free") return "premium";
  return "member";
}

function formatMessageTime(value: string) {
  const createdAt = new Date(value);
  const elapsedMs = Date.now() - createdAt.getTime();
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60000));

  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(createdAt);
}
