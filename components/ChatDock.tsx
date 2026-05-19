"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ChannelMessage,
  DiscussionChannel,
  discussionCategories,
} from "../data/discussionThreads";
import { uploadChatImage } from "../lib/chatMedia";
import {
  createDiscussionMessage,
  getDiscussionMessages,
  getSeedDiscussionMessages,
} from "../lib/discussions";
import { getProfilePermissions } from "../lib/profilePermissions";
import { getCurrentProfileFromSupabase } from "../lib/profiles";
import {
  EditableChatRoom,
  getSiteContent,
  SiteContent,
} from "../lib/siteContent";
import { getSupabaseClient } from "../lib/supabase";
import { searchTenorGifs, tenorGifToAttachment, TenorGif } from "../lib/tenor";
import { Profile, ProfilePermissions } from "../types/profile";

const loggedOutPermissions: ProfilePermissions = {
  canPost: false,
  canMessage: false,
  canComment: false,
  canCommentWithImages: false,
  canCommentWithGifs: false,
  canModerate: false,
};

export default function ChatDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const channels = useMemo(
    () => getDiscussionChannels(siteContent?.chatRooms),
    [siteContent]
  );
  const [activeChannelId, setActiveChannelId] = useState("general-chat");
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isGifSearchOpen, setIsGifSearchOpen] = useState(false);
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState<TenorGif[]>([]);
  const [messagesByChannel, setMessagesByChannel] = useState<
    Record<string, ChannelMessage[]>
  >(() => getSeedDiscussionMessages());
  const [unreadByChannel, setUnreadByChannel] = useState<Record<string, number>>(
    {}
  );
  const dockRef = useRef<HTMLElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isOpenRef = useRef(isOpen);
  const activeChannelIdRef = useRef(activeChannelId);
  const permissions = currentProfile
    ? getProfilePermissions(currentProfile)
    : loggedOutPermissions;
  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ?? channels[0];
  const activeMessages = activeChannel
    ? messagesByChannel[activeChannel.id] ?? []
    : [];
  const totalUnread = Object.values(unreadByChannel).reduce(
    (total, count) => total + count,
    0
  );

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
  }, [activeChannelId]);

  useEffect(() => {
    let isMounted = true;

    async function loadChat() {
      try {
        const [profile, content] = await Promise.all([
          getCurrentProfileFromSupabase(),
          getSiteContent(),
        ]);
        const loadedChannels = getDiscussionChannels(content.chatRooms);
        const loadedMessages = await getDiscussionMessages(
          loadedChannels.map((channel) => channel.id)
        );

        if (isMounted) {
          setCurrentProfile(profile);
          setSiteContent(content);
          setMessagesByChannel(loadedMessages);
          setActiveChannelId(loadedChannels[0]?.id ?? "general-chat");
        }
      } catch {
        if (isMounted) {
          setCurrentProfile(null);
        }
      }
    }

    loadChat();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const supabase = getSupabaseClient();
      const channel = supabase
        .channel("musehub-chat-dock")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "discussion_messages" },
          async () => {
            const channelIds = channels.map((room) => room.id);
            const loadedMessages = await getDiscussionMessages(
              channelIds
            );
            setMessagesByChannel((current) => {
              const unreadIncrements = channelIds.reduce<Record<string, number>>(
                (increments, channelId) => {
                  const nextLength = loadedMessages[channelId]?.length ?? 0;
                  const currentLength = current[channelId]?.length ?? 0;
                  const addedCount = Math.max(0, nextLength - currentLength);
                  const isReadingChannel =
                    isOpenRef.current &&
                    activeChannelIdRef.current === channelId;

                  if (addedCount > 0 && !isReadingChannel) {
                    increments[channelId] = addedCount;
                  }

                  return increments;
                },
                {}
              );

              if (Object.keys(unreadIncrements).length > 0) {
                setUnreadByChannel((currentUnread) => {
                  const nextUnread = { ...currentUnread };

                  Object.entries(unreadIncrements).forEach(
                    ([channelId, count]) => {
                      nextUnread[channelId] =
                        (nextUnread[channelId] ?? 0) + count;
                    }
                  );

                  return nextUnread;
                });
              }

              return loadedMessages;
            });
          }
        )
        .subscribe();

      subscription = { unsubscribe: () => supabase.removeChannel(channel) };
    } catch {
      subscription = undefined;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [channels]);

  useEffect(() => {
    if (!isOpen) return;

    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeMessages.length, activeChannelId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setUnreadByChannel((current) => ({
      ...current,
      [activeChannelId]: 0,
    }));
  }, [activeChannelId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!dockRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  async function handleSubmitMessage(attachment?: ChannelMessage["attachment"]) {
    if (!currentProfile || isSending || !activeChannel) return;

    const body = draftMessage.trim();
    if (!body && !attachment) return;

    try {
      setIsSending(true);
      setStatusMessage("");
      const newMessage = await createDiscussionMessage({
        channelId: activeChannel.id,
        profile: currentProfile,
        body: body || `Shared ${attachment?.label}`,
        attachment,
      });

      setMessagesByChannel((current) => ({
        ...current,
        [activeChannel.id]: [...(current[activeChannel.id] ?? []), newMessage],
      }));
      setUnreadByChannel((current) => ({
        ...current,
        [activeChannel.id]: 0,
      }));
      setDraftMessage("");
      setIsGifSearchOpen(false);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to send message."
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setStatusMessage("Uploading picture...");
      const attachment = await uploadChatImage(file);
      await handleSubmitMessage(attachment);
      setStatusMessage("");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to upload picture."
      );
    }
  }

  async function handleGifSearch() {
    const query = gifQuery.trim();
    if (!query) return;

    try {
      setStatusMessage("");
      setGifResults(await searchTenorGifs(query));
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to search GIFs."
      );
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-black text-blue-100 shadow-[0_18px_45px_rgba(0,0,0,0.4)] transition hover:border-blue-200 ${
          totalUnread > 0
            ? "border-blue-200 bg-blue-500/25 shadow-[0_0_28px_rgba(59,130,246,0.55)]"
            : "border-blue-400/35 bg-[#050811]"
        }`}
      >
        <span>Chat</span>
        {totalUnread > 0 && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-700">
            {formatUnreadCount(totalUnread)}
          </span>
        )}
      </button>
    );
  }

  return (
    <section
      ref={dockRef}
      className="fixed bottom-3 left-3 right-3 z-50 flex max-h-[78vh] flex-col overflow-hidden rounded-[8px] border border-blue-400/25 bg-[#050811]/95 text-white shadow-[0_20px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl md:bottom-4 md:left-4 md:right-auto md:top-24 md:h-auto md:max-h-none md:w-[340px]"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
          <div className="flex flex-wrap gap-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => {
                  setActiveChannelId(channel.id);
                  setUnreadByChannel((current) => ({
                    ...current,
                    [channel.id]: 0,
                  }));
                }}
                className={`inline-flex items-center gap-1 rounded-[4px] border px-3 py-1 text-xs font-black transition ${
                  activeChannelId === channel.id
                    ? "border-blue-300/60 bg-blue-500/20 text-blue-50"
                    : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-blue-400/35"
                }`}
              >
                <span>{channel.name}</span>
                {(unreadByChannel[channel.id] ?? 0) > 0 && (
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-black text-blue-700">
                    {formatUnreadCount(unreadByChannel[channel.id])}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-zinc-200 hover:border-blue-400/35"
            >
              Minimize
            </button>
          </div>
        </header>

        <div
          ref={feedRef}
          className="min-h-36 flex-1 overflow-y-auto px-3 py-2"
        >
          {activeMessages.length > 0 ? (
            activeMessages.map((message) => (
              <ChatDockMessage key={message.id} message={message} />
            ))
          ) : (
            <p className="py-10 text-center text-sm text-zinc-500">
              No messages yet.
            </p>
          )}
        </div>

        {isGifSearchOpen && (
          <div className="border-t border-white/10 px-3 py-2">
            <div className="flex gap-2">
              <input
                type="search"
                value={gifQuery}
                onChange={(event) => setGifQuery(event.target.value)}
                placeholder="Search Tenor GIFs..."
                className="min-w-0 flex-1 rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
              />
              <button
                type="button"
                onClick={handleGifSearch}
                className="rounded-[4px] border border-blue-400/45 bg-blue-500/15 px-3 text-xs font-black text-blue-100"
              >
                Search
              </button>
            </div>
            {gifResults.length > 0 && (
              <div className="mt-2 grid max-h-40 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {gifResults.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => handleSubmitMessage(tenorGifToAttachment(gif))}
                    className="overflow-hidden rounded-[4px] border border-white/10 bg-black/35"
                  >
                    <Image
                      src={gif.previewUrl}
                      alt={gif.title}
                      width={120}
                      height={90}
                      unoptimized
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="border-t border-white/10 px-3 py-2">
          {permissions.canComment ? (
            <form
              className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmitMessage();
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => setIsGifSearchOpen((current) => !current)}
                className="chat-mini-tool"
                title="Add GIF"
                aria-label="Add GIF"
              >
                GIF
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="chat-mini-tool"
                title="Upload picture"
                aria-label="Upload picture"
              >
                Pic
              </button>
              <input
                type="text"
                value={draftMessage}
                disabled={isSending}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder={`Message ${activeChannel?.name ?? "chat"}...`}
                className="min-w-0 flex-1 rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
              />
              <button
                type="submit"
                disabled={isSending}
                className="rounded-[4px] border border-blue-400/45 bg-blue-500/15 px-3 py-2 text-xs font-black text-blue-100 disabled:opacity-60"
              >
                Send
              </button>
            </form>
          ) : (
            <p className="text-sm text-zinc-500">
              Sign in as a member to chat.
            </p>
          )}
          {statusMessage && (
            <p className="mt-2 text-xs text-blue-100">{statusMessage}</p>
          )}
        </footer>
      </div>
    </section>
  );
}

function ChatDockMessage({ message }: { message: ChannelMessage }) {
  return (
    <article className="grid grid-cols-[28px_1fr] gap-2 py-1 text-sm">
      <Image
        src={message.authorAvatarUrl || "/images/profile-avatar.svg"}
        alt={`${message.authorName} avatar`}
        width={28}
        height={28}
        unoptimized
        className="h-7 w-7 rounded-[4px] border border-blue-400/25 bg-blue-500/10 object-cover"
      />
      <div className="min-w-0">
        <p className="leading-6">
          <Link
            href={`/profile/${message.authorUsername}`}
            className="font-black text-blue-300 hover:text-white"
          >
            @{message.authorName}
          </Link>{" "}
          <span>{message.body}</span>
        </p>
        {message.attachment && (
          <div className="mt-1 max-w-[220px] overflow-hidden rounded-[4px] border border-blue-400/20 bg-black/35">
            <Image
              src={message.attachment.url}
              alt={message.attachment.label}
              width={240}
              height={160}
              unoptimized
              className="max-h-40 w-full object-cover"
            />
          </div>
        )}
      </div>
      <span className="col-start-2 w-fit rounded-[4px] bg-blue-50 px-1.5 py-1 text-[10px] font-bold text-blue-700">
        {message.createdAt}
      </span>
    </article>
  );
}

function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function getDiscussionChannels(rooms?: EditableChatRoom[]): DiscussionChannel[] {
  const fallbackChannels = discussionCategories.flatMap(
    (category) => category.channels
  );
  const sourceRooms = rooms && rooms.length > 0 ? rooms : undefined;

  if (!sourceRooms) return fallbackChannels;

  return sourceRooms.map((room) => {
    const fallback = fallbackChannels.find((channel) => channel.id === room.id);

    return {
      id: room.id,
      name: room.name,
      symbol: "#",
      purpose: fallback?.purpose ?? room.name,
      description: room.description,
      kind: "text",
      allowedAttachments: ["gif", "image"],
      messages: fallback?.messages ?? [],
    };
  });
}
