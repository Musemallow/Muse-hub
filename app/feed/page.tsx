"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import PostCard from "../../components/PostCard";
import { mockPosts } from "../../data/mockPosts";
import { mockProfile } from "../../data/mockProfile";
import {
  clearDraftPostsFromDb,
  deleteDraftPostFromDb,
  getDraftPostsFromDb,
} from "../../lib/draftMediaDb";
import { getProfilePermissions } from "../../lib/profilePermissions";
import {
  getPublishedPostsFromDb,
  savePublishedPostToDb,
} from "../../lib/publishedPostsDb";
import { DraftPost } from "../../types/createPost";
import { Post } from "../../types/post";

export default function FeedPage() {
  const viewerPermissions = getProfilePermissions(mockProfile);
  const [draftPosts, setDraftPosts] = useState<DraftPost[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [hasLoadedDrafts, setHasLoadedDrafts] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const loadDrafts = useCallback(async () => {
    const drafts = await getDraftPostsFromDb();
    setDraftPosts(drafts);
  }, []);

  const loadPublishedPosts = useCallback(async () => {
    const posts = await getPublishedPostsFromDb();
    setPublishedPosts(posts);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadDrafts(), loadPublishedPosts()]);
    setHasLoadedDrafts(true);
  }, [loadDrafts, loadPublishedPosts]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const combinedPosts = useMemo(() => {
    const mappedDrafts: Post[] = viewerPermissions.canPost
      ? draftPosts.map((draft) => ({
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
          isDraft: true,
        }))
      : [];

    return [...mappedDrafts, ...publishedPosts, ...mockPosts];
  }, [draftPosts, publishedPosts, viewerPermissions.canPost]);

  async function handlePublish(post: Post) {
    if (!viewerPermissions.canPost) return;

    try {
      setActivePostId(post.id);

      const publishedPost: Post = {
        ...post,
        createdAt: new Date().toLocaleString(),
        isDraft: false,
      };

      await savePublishedPostToDb(publishedPost);
      await deleteDraftPostFromDb(post.id);
      await loadAll();
    } finally {
      setActivePostId(null);
    }
  }

  async function handleDeleteDraft(postId: string) {
    if (!viewerPermissions.canPost) return;

    try {
      setActivePostId(postId);
      await deleteDraftPostFromDb(postId);
      await loadDrafts();
    } finally {
      setActivePostId(null);
    }
  }

  async function handleClearDrafts() {
    if (!viewerPermissions.canPost) return;

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
              Creator Posts
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
              href="/hub"
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(80, 140, 255, 0.18)",
                background: "#0b0b0f",
                color: "#fff",
                fontSize: "14px",
              }}
            >
              Hub
            </Link>

            {viewerPermissions.canPost && (
              <>
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
              </>
            )}
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
          combinedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPublish={handlePublish}
              onDeleteDraft={handleDeleteDraft}
              isBusy={activePostId === post.id}
              permissions={viewerPermissions}
            />
          ))
        )}
      </div>
    </main>
  );
}
