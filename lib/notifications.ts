import { Json } from "../types/database";
import { Profile } from "../types/profile";
import { getCurrentProfileFromSupabase, getProfilesFromSupabase } from "./profiles";
import { getSupabaseClient } from "./supabase";

export type MuseNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  isRead: boolean;
  createdAt: string;
  actorName: string;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
  actor:
    | {
        display_name: string | null;
      }
    | null;
};

export async function createNotification({
  userId,
  actorId,
  type,
  title,
  body = "",
  href,
  metadata = {},
}: {
  userId: string;
  actorId?: string | null;
  type: string;
  title: string;
  body?: string;
  href?: string | null;
  metadata?: Json;
}) {
  try {
    const supabase = getSupabaseClient();
    await supabase.from("notifications").insert({
      user_id: userId,
      actor_id: actorId ?? null,
      type,
      title,
      body,
      href: href ?? null,
      metadata,
    });
  } catch {
    return;
  }
}

export async function notifyMembersAboutPost({
  actor,
  postId,
  title,
}: {
  actor: Profile;
  postId: string;
  title: string;
}) {
  try {
    const profiles = await getProfilesFromSupabase();
    const recipients = profiles.filter((profile) => profile.id !== actor.id);
    if (recipients.length === 0) return;

    const supabase = getSupabaseClient();
    await supabase.from("notifications").insert(
      recipients.map((profile) => ({
        user_id: profile.id,
        actor_id: actor.id,
        type: "post_published",
        title: "New MuseHub post",
        body: title,
        href: `/post/${postId}`,
        metadata: { postId },
      }))
    );
  } catch {
    return;
  }
}

export async function getCurrentNotifications() {
  const profile = await getCurrentProfileFromSupabase();
  if (!profile) return [];

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, type, title, body, href, read_at, created_at, actor:profiles!notifications_actor_id_fkey(display_name)"
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NotificationRow[]).map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    href: notification.href ?? "/notifications",
    isRead: Boolean(notification.read_at),
    createdAt: formatNotificationTime(notification.created_at),
    actorName: notification.actor?.display_name ?? "MuseHub",
  })) satisfies MuseNotification[];
}

export async function getUnreadNotificationCount(types?: string[]) {
  const profile = await getCurrentProfileFromSupabase();
  if (!profile) return 0;

  const supabase = getSupabaseClient();
  let query = supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .is("read_at", null);

  if (types && types.length > 0) {
    query = query.in("type", types);
  }

  const { count, error } = await query;

  if (error) return 0;

  return count ?? 0;
}

export async function markNotificationRead(notificationId: string) {
  const supabase = getSupabaseClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
}

export async function markDirectMessageNotificationsRead(senderUsername: string) {
  const profile = await getCurrentProfileFromSupabase();
  if (!profile) return;

  const supabase = getSupabaseClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .eq("type", "direct_message")
    .is("read_at", null)
    .contains("metadata", { senderUsername });
}

function formatNotificationTime(value: string) {
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
