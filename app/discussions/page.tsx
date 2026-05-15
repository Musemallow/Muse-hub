"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChannelMessage,
  DiscussionChannel,
  discussionCategories,
} from "../../data/discussionThreads";
import AuthNavLink from "../../components/AuthNavLink";
import {
  createDirectMessage as createPersistedDirectMessage,
  DirectMessageMember,
  DirectMessageThread,
  getDirectMessageThreads,
  getProfileDmMember,
} from "../../lib/directMessages";
import {
  createDiscussionMessage,
  getDiscussionMessages,
  getSeedDiscussionMessages,
} from "../../lib/discussions";
import { getProfilePermissions } from "../../lib/profilePermissions";
import { getCurrentProfileFromSupabase } from "../../lib/profiles";
import { getSupabaseClient } from "../../lib/supabase";
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

type ChatMode = "room" | "dm";

const featuredRoomIds = [
  "general-chat",
  "campfire",
  "now-playing",
  "creator-chat",
  "server-feedback",
];

const onlineMembers: DirectMessageMember[] = [
  {
    id: "musemallow",
    name: "MuseMallow",
    username: "musemallow",
    avatarUrl: "/images/profile-avatar.png",
    status: "online",
    role: "owner",
  },
  {
    id: "denithris",
    name: "Denithris",
    username: "denithris",
    avatarUrl: "/images/profile-avatar.svg",
    status: "online",
  },
  {
    id: "rune",
    name: "Rune Wolffe",
    username: "runewolffe",
    avatarUrl: "/images/profile-avatar.svg",
    status: "online",
  },
  {
    id: "phantom",
    name: "Phantom Bones",
    username: "phantombones",
    avatarUrl: "/images/profile-avatar.svg",
    status: "idle",
  },
  {
    id: "ashe",
    name: "Ashelia",
    username: "ashelia",
    avatarUrl: "/images/profile-avatar.svg",
    status: "online",
  },
  {
    id: "zerosic",
    name: "ZeroSic",
    username: "zerosic",
    avatarUrl: "/images/profile-avatar.svg",
    status: "online",
  },
];

const initialDmThreads: DirectMessageThread[] = [
  {
    id: "dm-musemallow",
    member: onlineMembers[0],
    unread: 1,
    messages: [
      {
        id: "dm-musemallow-1",
        authorName: "MuseMallow",
        authorUsername: "musemallow",
        authorAvatarUrl: "/images/profile-avatar.png",
        authorRole: "owner",
        createdAt: "12m ago",
        body: "I tucked the stream notes in here so they do not get buried in General.",
      },
    ],
  },
  {
    id: "dm-rune",
    member: onlineMembers[2],
    unread: 0,
    messages: [
      {
        id: "dm-rune-1",
        authorName: "Rune Wolffe",
        authorUsername: "runewolffe",
        authorAvatarUrl: "/images/profile-avatar.svg",
        authorRole: "member",
        createdAt: "28m ago",
        body: "Want to test the new room layout before tonight?",
      },
    ],
  },
];

export default function DiscussionsPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const channels = useMemo(
    () => discussionCategories.flatMap((category) => category.channels),
    []
  );
  const featuredRooms = useMemo(
    () =>
      featuredRoomIds
        .map((roomId) => channels.find((channel) => channel.id === roomId))
        .filter((channel): channel is DiscussionChannel => Boolean(channel)),
    [channels]
  );
  const [activeChannelId, setActiveChannelId] = useState(
    featuredRooms[0]?.id ?? channels[0]?.id ?? ""
  );
  const [activeDmId, setActiveDmId] = useState(initialDmThreads[0].id);
  const [chatMode, setChatMode] = useState<ChatMode>("room");
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messagesByChannel, setMessagesByChannel] = useState<
    Record<string, ChannelMessage[]>
  >(() => getSeedDiscussionMessages());
  const [dmThreads, setDmThreads] = useState(initialDmThreads);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const permissions = currentProfile
    ? getProfilePermissions(currentProfile)
    : loggedOutPermissions;

  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ?? channels[0];
  const activeDm =
    dmThreads.find((thread) => thread.id === activeDmId) ?? dmThreads[0];
  const activeMessages =
    chatMode === "room"
      ? messagesByChannel[activeChannel.id] ?? []
      : activeDm.messages;
  const canWrite = chatMode === "dm" ? Boolean(currentProfile) : permissions.canComment;

  useEffect(() => {
    const requestedDm = new URLSearchParams(window.location.search).get("dm");
    if (!requestedDm) return;

    openDmForUsername(requestedDm);
    // The first query-string read is enough here; later navigation remounts the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDiscussions() {
      try {
        const [profile, loadedMessages] = await Promise.all([
          getCurrentProfileFromSupabase(),
          getDiscussionMessages(channels.map((channel) => channel.id)),
        ]);

        if (isMounted) {
          setCurrentProfile(profile);
          setMessagesByChannel(loadedMessages);

          if (profile) {
            const loadedThreads = await getDirectMessageThreads(profile);

            if (isMounted && loadedThreads.length > 0) {
              setDmThreads((current) => mergeDmThreads(current, loadedThreads));
            }
          }
        }
      } catch {
        if (isMounted) {
          setCurrentProfile(null);
        }
      }
    }

    loadDiscussions();

    return () => {
      isMounted = false;
    };
  }, [channels]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const supabase = getSupabaseClient();
      const channel = supabase
        .channel("musehub-live-chat")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "discussion_messages" },
          async () => {
            const loadedMessages = await getDiscussionMessages(
              channels.map((room) => room.id)
            );
            setMessagesByChannel(loadedMessages);
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
    if (!currentProfile) return;

    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const supabase = getSupabaseClient();
      const channel = supabase
        .channel(`musehub-dms-${currentProfile.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "direct_messages" },
          async () => {
            const loadedThreads = await getDirectMessageThreads(currentProfile);
            setDmThreads((current) => mergeDmThreads(current, loadedThreads));
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
  }, [currentProfile]);

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeMessages.length, chatMode, activeChannelId, activeDmId]);

  async function handleSubmitMessage(attachmentType?: "gif" | "image") {
    if (!currentProfile || isSending) return;

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

    try {
      setIsSending(true);

      if (chatMode === "dm") {
        const newMessage = await createPersistedDirectMessage({
          sender: currentProfile,
          recipient: activeDm.member,
          body: body || `Shared ${attachment?.label}`,
          attachment,
        });

        setDmThreads((current) =>
          current.map((thread) =>
            thread.id === activeDm.id
              ? {
                  ...thread,
                  unread: 0,
                  messages: [...thread.messages, newMessage],
                }
              : thread
          )
        );
      } else {
        const newMessage = await createDiscussionMessage({
          channelId: activeChannel.id,
          profile: currentProfile,
          body: body || `Shared ${attachment?.label}`,
          attachment,
        });

        setMessagesByChannel((current) => ({
          ...current,
          [activeChannel.id]: [
            ...(current[activeChannel.id] ?? []),
            newMessage,
          ],
        }));
      }

      setDraftMessage("");
    } finally {
      setIsSending(false);
    }
  }

  function openRoom(roomId: string) {
    setActiveChannelId(roomId);
    setChatMode("room");
  }

  function openDm(threadId: string) {
    setActiveDmId(threadId);
    setChatMode("dm");
    setDmThreads((current) =>
      current.map((thread) =>
        thread.id === threadId ? { ...thread, unread: 0 } : thread
      )
    );
  }

  async function openDmForUsername(username: string) {
    const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();
    if (!cleanUsername) return;

    const existingThread = dmThreads.find(
      (thread) => thread.member.username.toLowerCase() === cleanUsername
    );

    if (existingThread) {
      openDm(existingThread.id);
      return;
    }

    const knownMember =
      (await getProfileDmMember(cleanUsername)) ??
      onlineMembers.find(
      (member) => member.username.toLowerCase() === cleanUsername
      );
    const member: DirectMessageMember = knownMember ?? {
      id: cleanUsername,
      name: cleanUsername,
      username: cleanUsername,
      avatarUrl: "/images/profile-avatar.svg",
      status: "online",
    };
    const threadId = `dm-${cleanUsername}`;

    setDmThreads((current) => [
      ...current,
      {
        id: threadId,
        member,
        unread: 0,
        messages: [],
      },
    ]);
    setActiveDmId(threadId);
    setChatMode("dm");
  }

  return (
    <main className="min-h-screen bg-[#06131d] px-3 py-4 text-white sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TopLinks />

        <section className="mt-5 overflow-hidden rounded-[8px] border border-cyan-300/25 bg-[#0b2635] shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
          <ChatHeader
            activeChannel={activeChannel}
            chatMode={chatMode}
            activeDm={activeDm}
          />

          <div className="grid min-h-[680px] lg:grid-cols-[230px_1fr_250px]">
            <RoomRail
              channels={channels}
              featuredRooms={featuredRooms}
              activeChannelId={activeChannel.id}
              messagesByChannel={messagesByChannel}
              onOpenRoom={openRoom}
            />

            <section className="flex min-h-[560px] flex-col border-y border-cyan-300/15 bg-[#123244] lg:border-x lg:border-y-0">
              <div className="flex flex-wrap items-center gap-2 border-b border-cyan-300/15 bg-[#0a2030] px-3 py-2">
                <RoomTabs
                  rooms={featuredRooms}
                  activeChannelId={activeChannel.id}
                  chatMode={chatMode}
                  onOpenRoom={openRoom}
                />
                <button
                  type="button"
                  onClick={() => setChatMode("dm")}
                  className={`rounded-[4px] border px-3 py-1 text-xs font-black uppercase transition ${
                    chatMode === "dm"
                      ? "border-fuchsia-300/60 bg-fuchsia-500/25 text-fuchsia-100"
                      : "border-cyan-300/20 bg-[#173c50] text-cyan-100 hover:border-cyan-200/45"
                  }`}
                >
                  DMs
                </button>
              </div>

              <div
                ref={feedRef}
                className="flex-1 space-y-2 overflow-y-auto px-3 py-3"
              >
                {activeMessages.length > 0 ? (
                  activeMessages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))
                ) : (
                  <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-cyan-100/55">
                    No messages yet. Start the room softly.
                  </div>
                )}
              </div>

              <Composer
                canWrite={canWrite}
                chatMode={chatMode}
                channelName={activeChannel.name}
                dmName={activeDm.member.name}
                draftMessage={draftMessage}
                isSending={isSending}
                permissions={permissions}
                onChangeDraft={setDraftMessage}
                onSubmitMessage={handleSubmitMessage}
              />
            </section>

            <RosterPanel
              dmThreads={dmThreads}
              activeDmId={activeDm.id}
              onlineMembers={onlineMembers}
              chatMode={chatMode}
              onOpenDm={openDm}
              onOpenDmForUsername={openDmForUsername}
            />
          </div>
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
        className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100"
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
        <Link className="hub-nav-link" href="/profiles">
          Members
        </Link>
        <Link className="hub-nav-link" href="/profile">
          Profile
        </Link>
        <AuthNavLink />
      </div>
    </nav>
  );
}

function ChatHeader({
  activeChannel,
  chatMode,
  activeDm,
}: {
  activeChannel: DiscussionChannel;
  chatMode: ChatMode;
  activeDm: DirectMessageThread;
}) {
  const title = chatMode === "room" ? activeChannel.name : activeDm.member.name;
  const description =
    chatMode === "room"
      ? activeChannel.description
      : `Private thread with @${activeDm.member.username}`;

  return (
    <header className="border-b border-cyan-300/20 bg-[#071b29] px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-black text-cyan-50">
            <span aria-hidden>{chatMode === "room" ? "Chat" : "DM"}</span>
            <span>{title}</span>
          </p>
          <p className="mt-1 text-xs text-cyan-100/55">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-cyan-100/80">
          <span className="text-xs font-semibold uppercase">Live</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        </div>
      </div>
    </header>
  );
}

function RoomRail({
  channels,
  featuredRooms,
  activeChannelId,
  messagesByChannel,
  onOpenRoom,
}: {
  channels: DiscussionChannel[];
  featuredRooms: DiscussionChannel[];
  activeChannelId: string;
  messagesByChannel: Record<string, ChannelMessage[]>;
  onOpenRoom: (roomId: string) => void;
}) {
  return (
    <aside className="bg-[#102c3c] p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">
          Rooms
        </p>
        <span className="rounded-[4px] bg-lime-400 px-2 py-1 text-xs font-black text-[#102c3c]">
          {channels.length}
        </span>
      </div>

      <div className="grid gap-1">
        {featuredRooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => onOpenRoom(room.id)}
            className={`flex items-center justify-between rounded-[4px] border px-2 py-2 text-left text-sm font-bold transition ${
              activeChannelId === room.id
                ? "border-cyan-200/65 bg-cyan-400/20 text-white"
                : "border-transparent bg-[#173c50] text-cyan-100/75 hover:border-cyan-200/35 hover:text-white"
            }`}
          >
            <span>
              <span className="text-cyan-200/55">#</span> {room.name}
            </span>
            <span className="rounded-[3px] bg-[#071b29] px-1.5 py-0.5 text-[11px] text-lime-200">
              {messagesByChannel[room.id]?.length ?? 0}
            </span>
          </button>
        ))}
      </div>

      <details className="mt-3 rounded-[4px] border border-cyan-300/20 bg-[#071b29]/70">
        <summary className="cursor-pointer px-2 py-2 text-xs font-black uppercase text-cyan-100">
          Browse rooms
        </summary>
        <div className="max-h-[300px] overflow-y-auto border-t border-cyan-300/15 p-2">
          {channels.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => onOpenRoom(room.id)}
              className="block w-full rounded-[4px] px-2 py-1.5 text-left text-xs font-semibold text-cyan-100/65 hover:bg-cyan-400/10 hover:text-white"
            >
              <span className="text-cyan-200/45">#</span> {room.name}
            </button>
          ))}
        </div>
      </details>
    </aside>
  );
}

function RoomTabs({
  rooms,
  activeChannelId,
  chatMode,
  onOpenRoom,
}: {
  rooms: DiscussionChannel[];
  activeChannelId: string;
  chatMode: ChatMode;
  onOpenRoom: (roomId: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {rooms.slice(0, 3).map((room) => (
        <button
          key={room.id}
          type="button"
          onClick={() => onOpenRoom(room.id)}
          className={`rounded-[4px] border px-3 py-1 text-xs font-black transition ${
            chatMode === "room" && activeChannelId === room.id
              ? "border-lime-200/70 bg-lime-400 text-[#102c3c]"
              : "border-cyan-300/20 bg-[#173c50] text-cyan-100 hover:border-cyan-200/45"
          }`}
        >
          {room.name}
        </button>
      ))}
    </div>
  );
}

function ChatMessage({ message }: { message: ChannelMessage }) {
  return (
    <article className="grid grid-cols-[34px_1fr_auto] gap-2 text-sm">
      <Image
        src={message.authorAvatarUrl || "/images/profile-avatar.svg"}
        alt={`${message.authorName} avatar`}
        width={34}
        height={34}
        unoptimized
        className="h-[34px] w-[34px] rounded-[4px] border border-cyan-200/20 bg-[#071b29] object-cover"
      />
      <div className="min-w-0">
        <p className="leading-6">
          <Link
            href={`/profile/${message.authorUsername}`}
            className="font-black text-sky-300 hover:text-white"
          >
            @ {message.authorName}
          </Link>{" "}
          <span className="text-white">{message.body}</span>
        </p>
        {message.attachment && (
          <div className="mt-2 max-w-xs overflow-hidden rounded-[4px] border border-cyan-300/20 bg-[#071b29]">
            <div className="relative aspect-video">
              <Image
                src={message.attachment.url}
                alt={message.attachment.label}
                fill
                unoptimized={message.attachment.type === "gif"}
                className="object-cover"
              />
            </div>
            <div className="border-t border-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-100">
              {message.attachment.label}
            </div>
          </div>
        )}
      </div>
      <span className="self-start rounded-[4px] bg-cyan-50 px-1.5 py-1 text-[10px] font-bold text-sky-600">
        {message.createdAt}
      </span>
    </article>
  );
}

function Composer({
  canWrite,
  chatMode,
  channelName,
  dmName,
  draftMessage,
  isSending,
  permissions,
  onChangeDraft,
  onSubmitMessage,
}: {
  canWrite: boolean;
  chatMode: ChatMode;
  channelName: string;
  dmName: string;
  draftMessage: string;
  isSending: boolean;
  permissions: ProfilePermissions;
  onChangeDraft: (value: string) => void;
  onSubmitMessage: (attachmentType?: "gif" | "image") => void;
}) {
  const placeholder =
    chatMode === "room"
      ? `Write a public message in #${channelName}...`
      : `Message ${dmName}...`;

  return (
    <footer className="border-t border-cyan-300/15 bg-[#102c3c] p-3">
      {canWrite ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmitMessage();
          }}
        >
          <div className="mb-2 flex items-center gap-3 text-cyan-100/80">
            <button type="button" className="composer-tool-button" title="Format">
              A
            </button>
            <button type="button" className="composer-tool-button" title="Bold">
              B
            </button>
            <button type="button" className="composer-tool-button" title="Italic">
              I
            </button>
            {permissions.canCommentWithGifs && (
              <button
                type="button"
                className="composer-tool-button"
                disabled={isSending}
                title="Add GIF"
                onClick={() => onSubmitMessage("gif")}
              >
                GIF
              </button>
            )}
            {permissions.canCommentWithImages && (
              <button
                type="button"
                className="composer-tool-button"
                disabled={isSending}
                title="Add image"
                onClick={() => onSubmitMessage("image")}
              >
                IMG
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={draftMessage}
              disabled={isSending}
              onChange={(event) => onChangeDraft(event.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-[4px] border border-cyan-300/15 bg-[#173c50] px-3 py-3 text-sm text-white outline-none placeholder:text-cyan-100/40 focus:border-cyan-200/55 disabled:cursor-not-allowed disabled:text-cyan-100/45"
            />
            <button
              type="submit"
              disabled={isSending}
              className="rounded-[4px] border border-sky-300/45 bg-sky-500/20 px-4 text-sm font-black text-sky-100 transition hover:border-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? "Sending" : "Submit"}
            </button>
          </div>
          <p className="mt-2 text-xs text-cyan-100/60">
            {draftMessage.trim().split(/\s+/).filter(Boolean).length} Words
          </p>
        </form>
      ) : (
        <p className="text-sm text-cyan-100/55">Sign in as a member to chat.</p>
      )}
    </footer>
  );
}

function RosterPanel({
  dmThreads,
  activeDmId,
  onlineMembers,
  chatMode,
  onOpenDm,
  onOpenDmForUsername,
}: {
  dmThreads: DirectMessageThread[];
  activeDmId: string;
  onlineMembers: DirectMessageMember[];
  chatMode: ChatMode;
  onOpenDm: (threadId: string) => void;
  onOpenDmForUsername: (username: string) => void;
}) {
  return (
    <aside className="bg-[#102c3c] p-3">
      <section>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">
          Direct Messages
        </p>
        <div className="grid gap-1">
          {dmThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => onOpenDm(thread.id)}
              className={`flex items-center gap-2 rounded-[4px] border px-2 py-2 text-left transition ${
                chatMode === "dm" && activeDmId === thread.id
                  ? "border-fuchsia-300/55 bg-fuchsia-500/18"
                  : "border-transparent hover:bg-cyan-400/10"
              }`}
            >
              <MemberAvatar member={thread.member} />
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-cyan-100">
                {thread.member.name}
              </span>
              {thread.unread > 0 && (
                <span className="rounded-[3px] bg-lime-400 px-1.5 py-0.5 text-[11px] font-black text-[#102c3c]">
                  {thread.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">
          Online
        </p>
        <div className="grid gap-1">
          {onlineMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm"
            >
              <MemberAvatar member={member} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${member.username}`}
                  className="block truncate font-bold text-sky-300 hover:text-white"
                >
                  {member.name}
                </Link>
                {member.role && (
                  <p className="text-[10px] uppercase text-cyan-100/45">
                    {member.role}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onOpenDmForUsername(member.username)}
                className="rounded-[4px] border border-cyan-300/20 px-2 py-1 text-[11px] font-black text-cyan-100 hover:border-cyan-200/55"
              >
                DM
              </button>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function MemberAvatar({ member }: { member: DirectMessageMember }) {
  return (
    <span className="relative shrink-0">
      <Image
        src={member.avatarUrl}
        alt={`${member.name} avatar`}
        width={28}
        height={28}
        unoptimized
        className="h-7 w-7 rounded-[4px] border border-cyan-200/20 bg-[#071b29] object-cover"
      />
      <span
        className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border border-[#102c3c] ${
          member.status === "online" ? "bg-lime-400" : "bg-amber-300"
        }`}
      />
    </span>
  );
}

function mergeDmThreads(
  current: DirectMessageThread[],
  incoming: DirectMessageThread[]
) {
  const threadsByUsername = new Map<string, DirectMessageThread>();

  current.forEach((thread) => {
    threadsByUsername.set(thread.member.username.toLowerCase(), thread);
  });

  incoming.forEach((thread) => {
    threadsByUsername.set(thread.member.username.toLowerCase(), thread);
  });

  return Array.from(threadsByUsername.values());
}
