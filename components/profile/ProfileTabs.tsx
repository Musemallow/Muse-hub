"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import FeedPostCard from "../FeedPostCard";
import {
  getProfileCommentActivity,
  ProfileCommentActivity,
} from "../../lib/profileActivity";
import {
  createComment,
  createPublishedPost,
  getPostComments,
  getPostsByCreator,
  updatePublishedPost,
} from "../../lib/posts";
import { uploadPostMedia } from "../../lib/postMedia";
import { getCurrentProfileFromSupabase } from "../../lib/profiles";
import { FeedPost, PostComment, PostMediaItem } from "../../types/content";
import { Profile } from "../../types/profile";

type ProfilePostState = {
  post: FeedPost;
  comments: PostComment[];
  draftComment: string;
  isCommentsOpen: boolean;
  isEditing: boolean;
  editContent: string;
  editVisibility: FeedPost["visibility"];
};

const postVisibilityOptions: FeedPost["visibility"][] = [
  "public",
  "members",
  "premium",
];

export default function ProfileTabs({
  profile,
  isCurrentUser = false,
}: {
  profile: Profile;
  isCurrentUser?: boolean;
}) {
  const [comments, setComments] = useState<ProfileCommentActivity[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [postStates, setPostStates] = useState<ProfilePostState[]>([]);
  const [status, setStatus] = useState("Loading profile activity...");
  const [composerContent, setComposerContent] = useState("");
  const [composerVisibility, setComposerVisibility] =
    useState<FeedPost["visibility"]>("public");
  const [composerFiles, setComposerFiles] = useState<File[]>([]);
  const [actionStatus, setActionStatus] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const canCreatePosts = isCurrentUser && profile.isCreator;
  const canComment = Boolean(currentProfile);
  const mediaSummary = useMemo(() => {
    const images = composerFiles.filter((file) => file.type.startsWith("image/"));
    const videos = composerFiles.filter((file) => file.type.startsWith("video/"));
    const audios = composerFiles.filter((file) => file.type.startsWith("audio/"));

    return `${images.length}/4 images • ${videos.length}/1 video • ${audios.length}/1 audio`;
  }, [composerFiles]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfileContent() {
      try {
        const [commentActivity, creatorPosts, viewerProfile] = await Promise.all([
          getProfileCommentActivity(profile.id).catch(() => []),
          profile.isCreator ? getPostsByCreator(profile.id).catch(() => []) : [],
          getCurrentProfileFromSupabase().catch(() => null),
        ]);
        const postCommentLists = await Promise.all(
          creatorPosts.map((post) => getPostComments(post.id).catch(() => []))
        );

        if (!isMounted) return;

        setComments(commentActivity);
        setCurrentProfile(viewerProfile);
        setPostStates(
          creatorPosts.map((post, index) => ({
            post,
            comments: postCommentLists[index] ?? [],
            draftComment: "",
            isCommentsOpen: false,
            isEditing: false,
            editContent: post.content,
            editVisibility: post.visibility,
          }))
        );
        setStatus(
          commentActivity.length === 0 && creatorPosts.length === 0
            ? "No public profile activity yet."
            : ""
        );
      } catch {
        if (!isMounted) return;

        setComments([]);
        setPostStates([]);
        setStatus("Profile activity unlocks after the alpha content tables are live.");
      }
    }

    loadProfileContent();

    return () => {
      isMounted = false;
    };
  }, [profile.id, profile.isCreator]);

  function updatePostState(
    postId: string,
    updater: (state: ProfilePostState) => ProfilePostState
  ) {
    setPostStates((current) =>
      current.map((state) => (state.post.id === postId ? updater(state) : state))
    );
  }

  function handleComposerFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    setActionStatus("");

    setComposerFiles((current) => {
      const nextFiles = [...current];

      selectedFiles.forEach((file) => {
        const imageCount = nextFiles.filter((item) =>
          item.type.startsWith("image/")
        ).length;
        const videoCount = nextFiles.filter((item) =>
          item.type.startsWith("video/")
        ).length;
        const audioCount = nextFiles.filter((item) =>
          item.type.startsWith("audio/")
        ).length;

        if (file.type.startsWith("image/") && imageCount < 4) {
          nextFiles.push(file);
        } else if (file.type.startsWith("video/") && videoCount < 1) {
          nextFiles.push(file);
        } else if (file.type.startsWith("audio/") && audioCount < 1) {
          nextFiles.push(file);
        }
      });

      return nextFiles;
    });
  }

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = composerContent.trim();

    if (!content && composerFiles.length === 0) return;

    setIsBusy(true);
    setActionStatus("Publishing post...");

    try {
      const uploadedMedia = await Promise.all(
        composerFiles.map((file) => uploadPostMedia(file, getMediaKind(file)))
      );
      await createPublishedPost({
        content,
        media: uploadedMedia,
        visibility: composerVisibility,
      });
      const refreshedPosts = await getPostsByCreator(profile.id);
      setPostStates(
        refreshedPosts.map((post) => ({
          post,
          comments: [],
          draftComment: "",
          isCommentsOpen: false,
          isEditing: false,
          editContent: post.content,
          editVisibility: post.visibility,
        }))
      );
      setComposerContent("");
      setComposerFiles([]);
      setActionStatus("Post published.");
    } catch (error) {
      setActionStatus(
        error instanceof Error ? error.message : "Unable to publish post."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUpdatePost(postState: ProfilePostState) {
    const content = postState.editContent.trim();
    if (!content || isBusy) return;

    setIsBusy(true);
    setActionStatus("Saving post...");

    try {
      await updatePublishedPost({
        postId: postState.post.id,
        content,
        visibility: postState.editVisibility,
      });
      updatePostState(postState.post.id, (state) => ({
        ...state,
        isEditing: false,
        post: {
          ...state.post,
          content,
          title: content.split("\n")[0].slice(0, 100) || "MuseHub Signal",
          visibility: state.editVisibility,
        },
      }));
      setActionStatus("Post updated.");
    } catch (error) {
      setActionStatus(
        error instanceof Error ? error.message : "Unable to update post."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleComment(postState: ProfilePostState) {
    const content = postState.draftComment.trim();
    if (!currentProfile || !content || isBusy) return;

    setIsBusy(true);
    setActionStatus("");

    try {
      await createComment(postState.post.id, content);
      const newComment: PostComment = {
        id: crypto.randomUUID(),
        authorName: currentProfile.displayName,
        username: currentProfile.username,
        content,
        createdAt: new Date().toISOString(),
      };
      updatePostState(postState.post.id, (state) => ({
        ...state,
        comments: [...state.comments, newComment],
        draftComment: "",
        post: { ...state.post, commentCount: state.post.commentCount + 1 },
      }));
    } catch (error) {
      setActionStatus(
        error instanceof Error ? error.message : "Unable to add comment."
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="space-y-5">
      {profile.isCreator && (
        <section className="rounded-[8px] border border-blue-400/15 bg-black/40 p-4 backdrop-blur-md sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Posts</h2>
            {canCreatePosts && (
              <span className="text-xs uppercase tracking-[0.22em] text-blue-300/70">
                Creator tools
              </span>
            )}
          </div>

          {canCreatePosts && (
            <form
              className="mt-4 grid gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-4"
              onSubmit={handleCreatePost}
            >
              <textarea
                value={composerContent}
                onChange={(event) => setComposerContent(event.target.value)}
                maxLength={2000}
                placeholder="Post from your profile..."
                className="min-h-28 rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <label className="chat-mini-tool cursor-pointer">
                    Media
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*"
                      onChange={handleComposerFiles}
                      className="hidden"
                    />
                  </label>
                  <select
                    value={composerVisibility}
                    onChange={(event) =>
                      setComposerVisibility(event.target.value as FeedPost["visibility"])
                    }
                    className="rounded-[4px] border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    {postVisibilityOptions.map((visibility) => (
                      <option key={visibility} value={visibility}>
                        {visibility}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-zinc-500">{mediaSummary}</span>
              </div>
              {composerFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
                  {composerFiles.map((file) => (
                    <button
                      key={`${file.name}-${file.lastModified}`}
                      type="button"
                      onClick={() =>
                        setComposerFiles((current) =>
                          current.filter((item) => item !== file)
                        )
                      }
                      className="rounded-full border border-white/10 bg-black/35 px-3 py-1"
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={
                  isBusy || (!composerContent.trim() && composerFiles.length === 0)
                }
                className="rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-600"
              >
                Publish Post
              </button>
            </form>
          )}

          {postStates.length === 0 ? (
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              No public posts yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {postStates.map((postState) => (
                <ProfilePostPanel
                  key={postState.post.id}
                  postState={postState}
                  canEdit={canCreatePosts}
                  canComment={canComment}
                  isBusy={isBusy}
                  onChange={(updater) =>
                    updatePostState(postState.post.id, updater)
                  }
                  onSave={() => handleUpdatePost(postState)}
                  onComment={() => handleComment(postState)}
                />
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

      {actionStatus && (
        <p className="rounded-[8px] border border-blue-400/20 bg-blue-500/10 p-3 text-sm text-blue-100">
          {actionStatus}
        </p>
      )}
    </section>
  );
}

function ProfilePostPanel({
  postState,
  canEdit,
  canComment,
  isBusy,
  onChange,
  onSave,
  onComment,
}: {
  postState: ProfilePostState;
  canEdit: boolean;
  canComment: boolean;
  isBusy: boolean;
  onChange: (updater: (state: ProfilePostState) => ProfilePostState) => void;
  onSave: () => void;
  onComment: () => void;
}) {
  return (
    <article className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
      {postState.isEditing ? (
        <div className="grid gap-3">
          <textarea
            value={postState.editContent}
            onChange={(event) =>
              onChange((state) => ({ ...state, editContent: event.target.value }))
            }
            className="min-h-28 rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-blue-400/45"
          />
          <select
            value={postState.editVisibility}
            onChange={(event) =>
              onChange((state) => ({
                ...state,
                editVisibility: event.target.value as FeedPost["visibility"],
              }))
            }
            className="rounded-[4px] border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white outline-none"
          >
            {postVisibilityOptions.map((visibility) => (
              <option key={visibility} value={visibility}>
                {visibility}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy || !postState.editContent.trim()}
              onClick={onSave}
              className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() =>
                onChange((state) => ({
                  ...state,
                  isEditing: false,
                  editContent: state.post.content,
                  editVisibility: state.post.visibility,
                }))
              }
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <FeedPostCard post={postState.post} compact />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onChange((state) => ({
                  ...state,
                  isCommentsOpen: !state.isCommentsOpen,
                }))
              }
              className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
            >
              {postState.isCommentsOpen ? "Hide Comments" : "Comment"}
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  onChange((state) => ({
                    ...state,
                    isEditing: true,
                    editContent: state.post.content,
                    editVisibility: state.post.visibility,
                  }))
                }
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white"
              >
                Edit
              </button>
            )}
          </div>
        </>
      )}

      {postState.isCommentsOpen && (
        <div className="mt-4 rounded-[8px] border border-blue-400/15 bg-black/35 p-4">
          <h3 className="text-sm font-bold text-white">Comments</h3>
          <div className="mt-3 grid gap-3">
            {postState.comments.length === 0 ? (
              <p className="text-sm text-zinc-500">No comments yet.</p>
            ) : (
              postState.comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {comment.authorName}
                    <span className="ml-2 text-xs text-zinc-500">
                      @{comment.username}
                    </span>
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                    {comment.content}
                  </p>
                </article>
              ))
            )}
          </div>
          <div className="mt-3 grid gap-2">
            <textarea
              value={postState.draftComment}
              onChange={(event) =>
                onChange((state) => ({
                  ...state,
                  draftComment: event.target.value,
                }))
              }
              disabled={!canComment || isBusy}
              placeholder={canComment ? "Leave a comment" : "Log in to comment"}
              className="min-h-24 rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={!canComment || isBusy || !postState.draftComment.trim()}
              onClick={onComment}
              className="rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-600"
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function getMediaKind(file: File): PostMediaItem["kind"] {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "image";
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
