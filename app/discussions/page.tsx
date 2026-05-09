"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChannelMessage,
  discussionCategories,
} from "../../data/discussionThreads";
import AuthNavLink from "../../components/AuthNavLink";
import { getProfilePermissions } from "../../lib/profilePermissions";
import { getCurrentProfileFromSupabase } from "../../lib/profiles";
import { Profile, ProfilePermissions } from "../../types/profile";

const sampleGifUrl =
  "data:image/gif;base64,R0lGODlhAQABAPAAAJYpKf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
const sampleImageUrl = "/images/musemallow-banner.jpeg";
const loggedOutPermissions: ProfilePermissions = {
  canPost: false,
  canMessage: false,
  canComment: false,
  canCommentWithImages: false,
  canCommentWithGifs: false,
  canModerate: false,
};

export default function DiscussionsPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const channels = useMemo(
    () => discussionCategories.flatMap((category) => category.channels),
    []
  );
  const [activeChannelId, setActiveChannelId] = useState(channels[0]?.id ?? "");
  const [draftMessage, setDraftMessage] = useState("");
  const [messagesByChannel, setMessagesByChannel] = useState<
    Record<string, ChannelMessage[]>
  >(() =>
    Object.fromEntries(
      channels.map((channel) => [channel.id, channel.messages])
    )
  );
  const permissions = currentProfile
    ? getProfilePermissions(currentProfile)
    : loggedOutPermissions;

  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ?? channels[0];
  const activeMessages = messagesByChannel[activeChannel.id] ?? [];

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const profile = await getCurrentProfileFromSupabase();

        if (isMounted) {
          setCurrentProfile(profile);
        }
      } catch {
        if (isMounted) {
          setCurrentProfile(null);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSubmitMessage(attachmentType?: "gif" | "image") {
    if (!currentProfile) return;

    const body = draftMessage.trim();
    const attachment =
      attachmentType === "gif"
        ? {
            type: "gif" as const,
            label: "reaction.gif",
            url: sampleGifUrl,
          }
        : attachmentType === "image"
          ? {
              type: "image" as const,
              label: "image-upload.png",
              url: sampleImageUrl,
            }
          : undefined;

    if (!body && !attachment) return;

    const newMessage: ChannelMessage = {
      id: `${activeChannel.id}-${Date.now()}`,
      authorName: currentProfile.displayName,
      authorUsername: currentProfile.username,
      authorRole:
        currentProfile.isCreator
          ? "owner"
          : currentProfile.role === "admin"
            ? "moderator"
            : currentProfile.role === "moderator"
              ? "moderator"
              : currentProfile.membership.tier !== "free"
                ? "premium"
                : "member",
      createdAt: "Just now",
      body: body || `Shared ${attachment?.label}`,
      attachmentLabel: attachment?.label,
      attachment,
    };

    setMessagesByChannel((current) => ({
      ...current,
      [activeChannel.id]: [...(current[activeChannel.id] ?? []), newMessage],
    }));
    setDraftMessage("");
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TopLinks />

        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Discussions
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Signal Rooms
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            MuseMallow creates the categories and channels. Members can reply
            inside them with text, GIFs, images, and later voice notes.
          </p>
        </section>

        <section className="mt-5 grid overflow-hidden rounded-[8px] border border-white/10 bg-[#050811] lg:min-h-[660px] lg:grid-cols-[290px_1fr]">
          <aside className="max-h-[360px] overflow-y-auto border-b border-white/10 bg-black/35 p-4 lg:max-h-none lg:border-b-0 lg:border-r">
            <div className="mb-4 rounded-[8px] border border-blue-400/20 bg-blue-500/10 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-blue-200">
                Owner Built
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Members reply. Only MuseMallow creates channels.
              </p>
            </div>

            <div className="grid gap-5">
              {discussionCategories.map((category) => (
                <div key={category.id}>
                  <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {category.name}
                  </p>
                  <div className="mt-2 grid gap-1">
                    {category.channels.map((channel) => {
                      const isActive = channel.id === activeChannel.id;

                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => setActiveChannelId(channel.id)}
                          className={`rounded-[8px] px-3 py-2 text-left text-sm font-semibold transition ${
                            isActive
                              ? "border border-blue-400/35 bg-blue-500/15 text-blue-100"
                              : "border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          <span className="text-zinc-500">#</span>{" "}
                          {channel.name}
                          {channel.isPremiumOnly && (
                            <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-blue-200">
                              premium
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[560px] flex-col lg:min-h-[660px]">
            <header className="border-b border-white/10 bg-black/25 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    <span className="text-zinc-500">#</span>{" "}
                    {activeChannel.name}
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                    {activeChannel.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeChannel.allowedAttachments.map((attachment) => (
                    <span
                      key={attachment}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300"
                    >
                      {attachment}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {activeMessages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-blue-400/25 bg-blue-500/10 text-sm font-black text-blue-100">
                      {message.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/profile/${message.authorUsername}`}
                          className="font-semibold text-white transition hover:text-blue-200"
                        >
                          {message.authorName}
                        </Link>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                          {message.authorRole}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {message.createdAt}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {message.body}
                  </p>
                  {message.attachment && (
                    <div className="mt-3 max-w-sm overflow-hidden rounded-[8px] border border-blue-400/25 bg-black/35">
                      <div className="relative aspect-video">
                        <Image
                          src={message.attachment.url}
                          alt={message.attachment.label}
                          fill
                          unoptimized={message.attachment.type === "gif"}
                          className="object-cover"
                        />
                      </div>
                      <div className="border-t border-white/10 px-3 py-2 text-sm font-semibold text-blue-100">
                        {message.attachment.label}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <footer className="border-t border-white/10 bg-black/25 p-4">
              {permissions.canComment ? (
                <form
                  className="flex flex-wrap items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmitMessage();
                  }}
                >
                  <input
                    type="text"
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    placeholder={`Reply in #${activeChannel.name}`}
                    className="min-w-[180px] flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
                  />
                  {permissions.canCommentWithGifs && (
                    <button
                      type="button"
                      className="reply-tool-button"
                      onClick={() => handleSubmitMessage("gif")}
                    >
                      GIF
                    </button>
                  )}
                  {permissions.canCommentWithImages && (
                    <button
                      type="button"
                      className="reply-tool-button"
                      onClick={() => handleSubmitMessage("image")}
                    >
                      Image
                    </button>
                  )}
                  <button type="submit" className="reply-submit-button">
                    Send
                  </button>
                </form>
              ) : (
                <p className="text-sm text-zinc-500">
                  Sign in as a member to reply.
                </p>
              )}
            </footer>
          </section>
        </section>
      </div>
    </main>
  );
}

function TopLinks() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3">
      <Link
        href="/hub"
        className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
      >
        Back to Hub
      </Link>
      <div className="flex flex-wrap gap-2">
        <Link className="hub-nav-link" href="/events">
          Schedule
        </Link>
        <Link className="hub-nav-link" href="/store">
          Store
        </Link>
        <Link className="hub-nav-link" href="/profile">
          Profile
        </Link>
        <AuthNavLink />
      </div>
    </nav>
  );
}
