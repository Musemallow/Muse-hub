import { FeedPost, PostComment, PostMediaItem } from "../types/content";
import { Json } from "../types/database";
import { getCurrentProfileFromSupabase } from "./profiles";
import { getSupabaseClient } from "./supabase";

type PostRow = {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  media: Json;
  visibility: "public" | "members" | "premium";
  published_at: string | null;
  created_at: string;
  profiles: {
    display_name: string;
  } | null;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
    username: string;
  } | null;
};

export async function createPublishedPost({
  content,
  media,
  visibility = "public",
}: {
  content: string;
  media: PostMediaItem[];
  visibility?: "public" | "members" | "premium";
}) {
  const profile = await getCurrentProfileFromSupabase();
  if (!profile?.isCreator) {
    throw new Error("Only the owner can publish posts.");
  }

  const supabase = getSupabaseClient();
  const title = makePostTitle(content);
  const publishedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      creator_id: profile.id,
      title,
      content,
      media,
      visibility,
      status: "published",
      published_at: publishedAt,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function getLatestPosts(limit = 3) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, creator_id, title, content, media, visibility, published_at, created_at, profiles(display_name)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const posts = await Promise.all(
    ((data ?? []) as PostRow[]).map((post) => mapFeedPost(post))
  );
  return posts;
}

export async function getPostsByCreator(creatorId: string, limit = 12) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, creator_id, title, content, media, visibility, published_at, created_at, profiles(display_name)")
    .eq("creator_id", creatorId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all(((data ?? []) as PostRow[]).map((post) => mapFeedPost(post)));
}

export async function getPostById(postId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, creator_id, title, content, media, visibility, published_at, created_at, profiles(display_name)")
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapFeedPost(data as PostRow) : null;
}

export async function getPostComments(postId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, content, created_at, profiles(display_name, username)")
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CommentRow[]).map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.created_at,
    authorName: comment.profiles?.display_name ?? "Wanderer",
    username: comment.profiles?.username ?? "wanderer",
  })) satisfies PostComment[];
}

export async function createComment(postId: string, content: string) {
  const profile = await getCurrentProfileFromSupabase();
  if (!profile) {
    throw new Error("Log in to comment.");
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: profile.id,
    content,
    attachments: [],
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function togglePostLike(post: FeedPost) {
  const profile = await getCurrentProfileFromSupabase();
  if (!profile) {
    throw new Error("Log in to like posts.");
  }

  const supabase = getSupabaseClient();

  if (post.viewerHasLiked) {
    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", profile.id)
      .eq("type", "like");

    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("reactions").insert({
    post_id: post.id,
    user_id: profile.id,
    type: "like",
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function mapFeedPost(post: PostRow): Promise<FeedPost> {
  const supabase = getSupabaseClient();
  const [{ count: likeCount }, { count: commentCount }, profile] =
    await Promise.all([
      supabase
        .from("reactions")
        .select("id", { count: "exact", head: true })
        .eq("post_id", post.id)
        .eq("type", "like"),
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("post_id", post.id)
        .eq("is_hidden", false),
      getCurrentProfileFromSupabase().catch(() => null),
    ]);

  let viewerHasLiked = false;

  if (profile) {
    const { data } = await supabase
      .from("reactions")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", profile.id)
      .eq("type", "like")
      .maybeSingle();

    viewerHasLiked = Boolean(data);
  }

  return {
    id: post.id,
    creatorId: post.creator_id,
    authorName: post.profiles?.display_name ?? "MuseMallow",
    title: post.title,
    content: post.content,
    media: parsePostMedia(post.media),
    visibility: post.visibility,
    publishedAt: post.published_at ?? post.created_at,
    likeCount: likeCount ?? 0,
    commentCount: commentCount ?? 0,
    viewerHasLiked,
  };
}

function parsePostMedia(value: Json): PostMediaItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, Json | undefined>;
    const kind = record.kind;
    const url = record.url;
    const name = record.name;
    const contentType = record.contentType;

    if (
      (kind !== "image" && kind !== "video" && kind !== "audio") ||
      typeof url !== "string" ||
      typeof name !== "string" ||
      typeof contentType !== "string"
    ) {
      return [];
    }

    return [
      {
        id: typeof record.id === "string" ? record.id : crypto.randomUUID(),
        kind,
        url,
        name,
        contentType,
      },
    ];
  });
}

function makePostTitle(content: string) {
  const firstLine = content.trim().split("\n")[0] || "MuseHub Signal";
  return firstLine.length > 100 ? `${firstLine.slice(0, 97)}...` : firstLine;
}
