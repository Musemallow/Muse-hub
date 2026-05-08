import { notFound } from "next/navigation";
import PostDetailClient from "../../../components/PostDetailClient";
import { getCurrentProfileFromSupabase } from "../../../lib/profiles";
import { getPostById, getPostComments } from "../../../lib/posts";

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await getPostById(postId);

  if (!post) {
    notFound();
  }

  const [comments, currentProfile] = await Promise.all([
    getPostComments(post.id).catch(() => []),
    getCurrentProfileFromSupabase().catch(() => null),
  ]);

  return (
    <PostDetailClient
      initialPost={post}
      initialComments={comments}
      currentProfile={currentProfile}
    />
  );
}
