import { ChannelMessage } from "../data/discussionThreads";
import { Json } from "../types/database";
import { Profile } from "../types/profile";
import { createNotification } from "./notifications";
import { getSupabaseClient } from "./supabase";

export type DirectMessageMember = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  status: "online" | "idle";
  role?: string;
};

export type DirectMessageThread = {
  id: string;
  member: DirectMessageMember;
  unread: number;
  messages: ChannelMessage[];
};

type DirectMessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  attachment: Json;
  created_at: string;
  sender:
    | {
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
        role: Profile["role"] | null;
        membership_tier: Profile["membership"]["tier"] | "premium" | null;
      }
    | null;
  recipient:
    | {
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
        role: Profile["role"] | null;
        membership_tier: Profile["membership"]["tier"] | "premium" | null;
      }
    | null;
};

type ProfileLookupRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: Profile["role"] | null;
};

export async function getDirectMessageThreads(profile: Profile) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("direct_messages")
      .select(
        "id, sender_id, recipient_id, body, attachment, created_at, sender:profiles!direct_messages_sender_id_fkey(username, display_name, avatar_url, role, membership_tier), recipient:profiles!direct_messages_recipient_id_fkey(username, display_name, avatar_url, role, membership_tier)"
      )
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true });

    if (error) return [];

    return rowsToThreads(profile, (data ?? []) as DirectMessageRow[]);
  } catch {
    return [];
  }
}

export async function getProfileDmMember(username: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, role")
      .eq("username", username)
      .maybeSingle();

    if (error || !data) return null;

    return mapProfileLookupToMember(data as ProfileLookupRow);
  } catch {
    return null;
  }
}

export async function createDirectMessage({
  sender,
  recipient,
  body,
  attachment,
}: {
  sender: Profile;
  recipient: DirectMessageMember;
  body: string;
  attachment?: ChannelMessage["attachment"];
}) {
  const optimisticMessage = createLocalDirectMessage({ sender, body, attachment });

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("direct_messages")
      .insert({
        sender_id: sender.id,
        recipient_id: recipient.id,
        body,
        attachment: attachment ?? null,
      })
      .select(
        "id, sender_id, recipient_id, body, attachment, created_at, sender:profiles!direct_messages_sender_id_fkey(username, display_name, avatar_url, role, membership_tier), recipient:profiles!direct_messages_recipient_id_fkey(username, display_name, avatar_url, role, membership_tier)"
      )
      .single();

    if (error || !data) return optimisticMessage;

    await createNotification({
      userId: recipient.id,
      actorId: sender.id,
      type: "direct_message",
      title: `New message from ${sender.displayName}`,
      body,
      href: `/discussions?dm=${sender.username}`,
      metadata: { senderUsername: sender.username },
    });

    return mapDirectMessageRow(data as DirectMessageRow);
  } catch {
    return optimisticMessage;
  }
}

export function createLocalDirectMessage({
  sender,
  body,
  attachment,
}: {
  sender: Profile;
  body: string;
  attachment?: ChannelMessage["attachment"];
}): ChannelMessage {
  return {
    id: `dm-${Date.now()}`,
    authorName: sender.displayName,
    authorUsername: sender.username,
    authorAvatarUrl: sender.avatarUrl || "/images/profile-avatar.svg",
    authorRole: getDiscussionRole(sender),
    createdAt: "Just now",
    body,
    attachment,
    attachmentLabel: attachment?.label,
  };
}

function rowsToThreads(profile: Profile, rows: DirectMessageRow[]) {
  const threadsByMember = new Map<string, DirectMessageThread>();

  rows.forEach((row) => {
    const isSender = row.sender_id === profile.id;
    const memberId = isSender ? row.recipient_id : row.sender_id;
    const memberProfile = isSender ? row.recipient : row.sender;
    const member = mapJoinedProfileToMember(memberId, memberProfile);
    const existing = threadsByMember.get(memberId);

    if (existing) {
      existing.messages.push(mapDirectMessageRow(row));
      return;
    }

    threadsByMember.set(memberId, {
      id: `dm-${member.username}`,
      member,
      unread: 0,
      messages: [mapDirectMessageRow(row)],
    });
  });

  return Array.from(threadsByMember.values()).sort((a, b) => {
    const aLast = a.messages.at(-1)?.id ?? "";
    const bLast = b.messages.at(-1)?.id ?? "";
    return bLast.localeCompare(aLast);
  });
}

function mapDirectMessageRow(row: DirectMessageRow): ChannelMessage {
  const sender = row.sender;
  const attachment = parseAttachment(row.attachment);

  return {
    id: row.id,
    authorName: sender?.display_name || "Wanderer",
    authorUsername: sender?.username || "wanderer",
    authorAvatarUrl: sender?.avatar_url || "/images/profile-avatar.svg",
    authorRole: getRowDiscussionRole(sender),
    createdAt: formatMessageTime(row.created_at),
    body: row.body,
    attachment,
    attachmentLabel: attachment?.label,
  };
}

function mapProfileLookupToMember(row: ProfileLookupRow): DirectMessageMember {
  return {
    id: row.id,
    name: row.display_name || row.username || "Wanderer",
    username: row.username || "wanderer",
    avatarUrl: row.avatar_url || "/images/profile-avatar.svg",
    status: "online",
    role: row.role === "owner" ? "owner" : undefined,
  };
}

function mapJoinedProfileToMember(
  id: string,
  profile: DirectMessageRow["sender"]
): DirectMessageMember {
  return {
    id,
    name: profile?.display_name || profile?.username || "Wanderer",
    username: profile?.username || "wanderer",
    avatarUrl: profile?.avatar_url || "/images/profile-avatar.svg",
    status: "online",
    role: profile?.role === "owner" ? "owner" : undefined,
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
  profile: DirectMessageRow["sender"]
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
