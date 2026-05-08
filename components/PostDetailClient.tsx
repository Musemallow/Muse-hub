"use client";

import Link from "next/link";
import { useState } from "react";
import FeedPostCard from "./FeedPostCard";
import { createComment, togglePostLike } from "../lib/posts";
import { FeedPost, PostComment } from "../types/content";
import { Profile } from "../types/profile";

export default function PostDetailClient({
  initialPost,
  initialComments,
  currentProfile,
}: {
  initialPost: FeedPost;
  initialComments: PostComment[];
  currentProfile: Profile | null;
}) {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialComments);
  const [draftComment, setDraftComment] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function handleLike() {
    if (!currentProfile || isBusy) {
      setStatusMessage("Log in to like posts.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("");

    try {
      await togglePostLike(post);
      setPost((prev) => ({
        ...prev,
        viewerHasLiked: !prev.viewerHasLiked,
        likeCount: prev.viewerHasLiked
          ? Math.max(0, prev.likeCount - 1)
          : prev.likeCount + 1,
      }));
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to update like."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentProfile) {
      setStatusMessage("Log in to comment.");
      return;
    }

    const content = draftComment.trim();
    if (!content || isBusy) return;

    setIsBusy(true);
    setStatusMessage("");

    try {
      await createComment(post.id, content);
      const newComment: PostComment = {
        id: crypto.randomUUID(),
        authorName: currentProfile.displayName,
        username: currentProfile.username,
        content,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
      setDraftComment("");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to add comment."
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hub"
            className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
          >
            Back to Hub
          </Link>
          <Link className="hub-nav-link" href="/profile">
            Profile
          </Link>
        </nav>

        <section className="mt-8 grid gap-5">
          <FeedPostCard post={post} />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isBusy}
              onClick={handleLike}
              className="rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-600"
            >
              {post.viewerHasLiked ? "Unlike" : "Like"}
            </button>
          </div>

          <section className="rounded-[8px] border border-blue-400/15 bg-[#050811]/90 p-5">
            <h2 className="text-xl font-bold text-white">Comments</h2>

            <form className="mt-4 grid gap-3" onSubmit={handleComment}>
              <textarea
                value={draftComment}
                onChange={(event) => setDraftComment(event.target.value)}
                maxLength={2000}
                placeholder={
                  currentProfile
                    ? "Leave a comment"
                    : "Log in to leave a comment"
                }
                disabled={!currentProfile || isBusy}
                className="min-h-28 rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45 disabled:cursor-not-allowed disabled:text-zinc-600"
              />
              <button
                type="submit"
                disabled={!currentProfile || !draftComment.trim() || isBusy}
                className="rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-600"
              >
                Comment
              </button>
            </form>

            {statusMessage && (
              <p className="mt-4 rounded-[8px] border border-blue-400/20 bg-blue-500/10 p-3 text-sm text-blue-100">
                {statusMessage}
              </p>
            )}

            <div className="mt-5 grid gap-3">
              {comments.length === 0 ? (
                <p className="text-sm text-zinc-500">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">
                        {comment.authorName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        @{comment.username} / {formatCommentDate(comment.createdAt)}
                      </p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                      {comment.content}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
