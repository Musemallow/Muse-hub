import { getSupabaseClient } from "./supabase";

export type ProfileCommentActivity = {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  createdAt: string;
};

type CommentActivityRow = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  posts: {
    title: string | null;
  } | null;
};

export async function getProfileCommentActivity(profileId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, content, created_at, posts(title)")
    .eq("user_id", profileId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CommentActivityRow[]).map((comment) => ({
    id: comment.id,
    postId: comment.post_id,
    postTitle: comment.posts?.title || "Untitled signal",
    content: comment.content,
    createdAt: comment.created_at,
  }));
}
