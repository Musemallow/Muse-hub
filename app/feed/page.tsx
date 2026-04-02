"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PostCard from "../../components/PostCard";
import { mockPosts } from "../../data/mockPosts";
import { getDraftPostsFromDb, clearDraftPostsFromDb } from "../../lib/draftMediaTEMP";
import { DraftPost } from "../../types/createPost";
import { Post } from "../../types/post";

export default function FeedPage() {
  const [draftPosts, setDraftPosts] = useState<DraftPost[]>([]);
  const [hasLoadedDrafts, setHasLoadedDrafts] = useState(false);

  async function loadDrafts() {
    const drafts = await getDraftPostsFromDb();
    setDraftPosts(drafts);
    setHasLoadedDrafts(true);
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  const combinedPosts = useMemo(() => {
    const mappedDrafts: Post[] = draftPosts.map((draft) => ({
      id: draft.id,
      authorName: "Musemallow",
      caption: draft.caption || "(No caption)",
      createdAt: "Local draft",
      images: draft.images.map((image, index) => ({
        id: `${draft.id}-image-${index}`,
        uri: image.dataUrl,
      })),
      videos: draft.videos.map((video, index) => ({
        id: `${draft.id}-video-${index}`,
        uri: video.dataUrl,
        title: video.name || "Draft Video",
      })),
      audios: draft.audios.map((audio, index) => ({
        id: `${draft.id}-audio-${index}`,
        uri: audio.dataUrl,
        title: audio.name || "Draft Audio",
        duration: "--:--",
      })),
      likeCount: 0,
      commentCount: 0,
    }));

    return [...mappedDrafts, ...mockPosts];
  }, [draftPosts]);

  async function handleClearDrafts() {
    await clearDraftPostsFromDb();
    await loadDrafts();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "28px 16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
              }}
            >
              Feed
            </h1>
            <p
              style={{
                margin: "6px 0 0 0",
                opacity: 0.7,
                fontSize: "14px",
              }}
            >
              {hasLoadedDrafts
                ? `${draftPosts.length} local draft${
                    draftPosts.length === 1 ? "" : "s"
                  } loaded`
                : "Loading local drafts..."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(80, 140, 255, 0.18)",
                background: "#0b0b0f",
                color: "#fff",
                fontSize: "14px",
              }}
            >
              Home
            </Link>

            <Link
              href="/create"
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(80, 140, 255, 0.18)",
                background: "#0b0b0f",
                color: "#fff",
                fontSize: "14px",
              }}
            >
              Create Post
            </Link>

            <button
              type="button"
              onClick={handleClearDrafts}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Clear Drafts
            </button>
          </div>
        </div>

        {combinedPosts.length === 0 ? (
          <div
            style={{
              background: "#0b0b0f",
              border: "1px solid rgba(80, 140, 255, 0.14)",
              borderRadius: 18,
              padding: 16,
              color: "#fff",
              opacity: 0.75,
            }}
          >
            No posts yet.
          </div>
        ) : (
          combinedPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </main>
  );
}