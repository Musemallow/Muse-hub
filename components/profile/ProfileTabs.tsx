"use client";

import { useEffect, useState } from "react";
import FeedPostCard from "../FeedPostCard";
import {
  getProfileCommentActivity,
  ProfileCommentActivity,
} from "../../lib/profileActivity";
import { getPostsByCreator } from "../../lib/posts";
import { FeedPost } from "../../types/content";
import { Profile } from "../../types/profile";

export default function ProfileTabs({ profile }: { profile: Profile }) {
  const [comments, setComments] = useState<ProfileCommentActivity[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [status, setStatus] = useState("Loading profile activity...");

  useEffect(() => {
    let isMounted = true;

    async function loadProfileContent() {
      try {
        const [commentActivity, creatorPosts] = await Promise.all([
          getProfileCommentActivity(profile.id).catch(() => []),
          profile.isCreator ? getPostsByCreator(profile.id).catch(() => []) : [],
        ]);

        if (!isMounted) return;

        setComments(commentActivity);
        setPosts(creatorPosts);
        setStatus(
          commentActivity.length === 0 && creatorPosts.length === 0
            ? "No public profile activity yet."
            : ""
        );
      } catch {
        if (!isMounted) return;

        setComments([]);
        setPosts([]);
        setStatus("Profile activity unlocks after the alpha content tables are live.");
      }
    }

    loadProfileContent();

    return () => {
      isMounted = false;
    };
  }, [profile.id, profile.isCreator]);

  return (
    <section className="space-y-5">
      {profile.isCreator && (
        <section className="rounded-[8px] border border-blue-400/15 bg-black/40 p-4 backdrop-blur-md sm:p-5">
          <h2 className="text-lg font-semibold text-white">Posts</h2>
          {posts.length === 0 ? (
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              No public posts yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {posts.map((post) => (
                <FeedPostCard key={post.id} post={post} compact />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="rounded-[8px] border border-blue-400/15 bg-black/40 p-4 backdrop-blur-md sm:p-5">
        <h2 className="text-lg font-semibold text-white">Comments</h2>

        {status && (
          <p className="mt-2 text-sm leading-7 text-zinc-400">{status}</p>
        )}

        {comments.length > 0 && (
          <div className="mt-4 grid gap-3">
            {comments.map((item) => (
              <article
                key={item.id}
                className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300/70">
                  Commented on {item.postTitle}
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  {item.content}
                </p>
                <p className="mt-3 text-xs text-zinc-500">
                  {formatCommentDate(item.createdAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
