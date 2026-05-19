"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import AuthNavLink from "../../components/AuthNavLink";
import { ChannelMessage } from "../../data/discussionThreads";
import { uploadChatImage } from "../../lib/chatMedia";
import {
  blockDirectMessageMember,
  createDirectMessage,
  DirectMessageMember,
  DirectMessageThread,
  getBlockedDirectMessageMemberIds,
  getDirectMessageThreads,
  getProfileDmMember,
  reportDirectMessageMember,
} from "../../lib/directMessages";
import { markDirectMessageNotificationsRead } from "../../lib/notifications";
import { getCurrentProfileFromSupabase, getProfilesFromSupabase } from "../../lib/profiles";
import { getSupabaseClient } from "../../lib/supabase";
import { searchTenorGifs, tenorGifToAttachment, TenorGif } from "../../lib/tenor";
import { Profile } from "../../types/profile";

export default function MessagesPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [threads, setThreads] = useState<DirectMessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [blockedMemberIds, setBlockedMemberIds] = useState<Set<string>>(
    () => new Set()
  );
  const [isGifSearchOpen, setIsGifSearchOpen] = useState(false);
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState<TenorGif[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const activeThread =
    threads.find((thread) => thread.id === activeThreadId) ?? threads[0];
  const isActiveMemberBlocked = activeThread
    ? blockedMemberIds.has(activeThread.member.id)
    : false;
  const filteredProfiles = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    const members = currentProfile
      ? profiles.filter((profile) => profile.id !== currentProfile.id)
      : profiles;

    if (!query) return members;

    return members.filter((profile) =>
      `${profile.displayName} ${profile.username} ${profile.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [currentProfile, memberQuery, profiles]);

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      try {
        const [profile, loadedProfiles] = await Promise.all([
          getCurrentProfileFromSupabase(),
          getProfilesFromSupabase(),
        ]);
        const requestedDm = new URLSearchParams(window.location.search).get("dm");

        if (!isMounted) return;

        setCurrentProfile(profile);
        setProfiles(loadedProfiles);

        if (!profile) return;

        const loadedThreads = await getDirectMessageThreads(profile);
        const blockedIds = await getBlockedDirectMessageMemberIds(profile.id);
        let nextThreads = loadedThreads;

        if (requestedDm) {
          const member = await getProfileDmMember(requestedDm);
          if (member && member.id !== profile.id) {
            nextThreads = ensureThread(nextThreads, member);
            setActiveThreadId(`dm-${member.username}`);
          }
        } else if (nextThreads[0]) {
          setActiveThreadId(nextThreads[0].id);
        }

        if (isMounted) {
          setThreads(nextThreads);
          setBlockedMemberIds(blockedIds);
        }
      } catch (error) {
        if (isMounted) {
          setStatusMessage(
            error instanceof Error ? error.message : "Unable to load messages."
          );
        }
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentProfile) return;

    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const supabase = getSupabaseClient();
      const channel = supabase
        .channel(`musehub-messages-${currentProfile.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "direct_messages" },
          async () => {
            const loadedThreads = await getDirectMessageThreads(currentProfile);
            setThreads((current) => mergeThreads(current, loadedThreads));
            setActiveThreadId((current) => current || loadedThreads[0]?.id || "");
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
  }, [activeThread?.messages.length, activeThreadId]);

  useEffect(() => {
    if (!activeThread) return;

    markDirectMessageNotificationsRead(activeThread.member.username).catch(
      () => undefined
    );
  }, [activeThread]);

  function openMember(profile: Profile) {
    const member: DirectMessageMember = {
      id: profile.id,
      name: profile.displayName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      status: "online",
      role: profile.role === "owner" ? "owner" : undefined,
    };

    setThreads((current) => ensureThread(current, member));
    setActiveThreadId(`dm-${member.username}`);
  }

  async function sendMessage(attachment?: ChannelMessage["attachment"]) {
    if (!currentProfile || !activeThread || isSending || isActiveMemberBlocked) {
      return;
    }

    const body = draftMessage.trim();
    if (!body && !attachment) return;

    try {
      setIsSending(true);
      setStatusMessage("");
      const message = await createDirectMessage({
        sender: currentProfile,
        recipient: activeThread.member,
        body: body || `Shared ${attachment?.label}`,
        attachment,
      });

      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeThread.id
            ? {
                ...thread,
                lastMessageAt: new Date().toISOString(),
                messages: [...thread.messages, message],
              }
            : thread
        )
      );
      setThreads((current) => sortThreadsByActivity(current));
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
      await sendMessage(await uploadChatImage(file));
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

  async function handleBlockActiveMember() {
    if (!activeThread) return;

    const confirmed = window.confirm(
      `Block @${activeThread.member.username} from privately messaging you?`
    );
    if (!confirmed) return;

    try {
      await blockDirectMessageMember(activeThread.member.id);
      setBlockedMemberIds((current) => new Set(current).add(activeThread.member.id));
      setStatusMessage(`Blocked @${activeThread.member.username} from DMs.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to block this member."
      );
    }
  }

  async function handleReportActiveMember() {
    if (!activeThread) return;

    const reason = window.prompt(
      `Report @${activeThread.member.username}. What should moderators know?`
    );
    if (reason === null) return;

    try {
      await reportDirectMessageMember({
        reportedId: activeThread.member.id,
        reason,
        messageIds: activeThread.messages.map((message) => message.id),
      });
      setStatusMessage(`Report sent for @${activeThread.member.username}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to report this member."
      );
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 pb-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hub"
            className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
          >
            Back to Hub
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="hub-nav-link" href="/profiles">
              Members
            </Link>
            <Link className="hub-nav-link" href="/notifications">
              Notifications
            </Link>
            <AuthNavLink />
          </div>
        </nav>

        <section className="mt-5 grid overflow-hidden rounded-[8px] border border-blue-400/20 bg-[#050811] lg:min-h-[680px] lg:grid-cols-[300px_1fr]">
          <aside className="border-b border-blue-400/15 bg-black/35 p-3 lg:border-b-0 lg:border-r">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/75">
              Messages
            </p>
            <input
              type="search"
              value={memberQuery}
              onChange={(event) => setMemberQuery(event.target.value)}
              placeholder="Find a member..."
              className="mt-3 w-full rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
            />

            <div className="mt-4 grid gap-1">
              {threads.length > 0 && (
                <div className="mb-3 border-b border-white/10 pb-3">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    Recent DMs
                  </p>
                  <div className="grid gap-1">
                    {threads.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setActiveThreadId(thread.id)}
                        className={`grid grid-cols-[28px_1fr_auto] items-center gap-2 rounded-[4px] px-2 py-2 text-left text-sm transition ${
                          activeThread?.id === thread.id
                            ? "bg-blue-500/15 text-white"
                            : "text-zinc-300 hover:bg-blue-500/10 hover:text-white"
                        }`}
                      >
                        <Image
                          src={thread.member.avatarUrl}
                          alt={`${thread.member.name} avatar`}
                          width={28}
                          height={28}
                          unoptimized
                          className="h-7 w-7 rounded-[4px] border border-blue-400/25 object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-bold">
                            {thread.member.name}
                          </span>
                          <span className="block truncate text-xs text-zinc-500">
                            {getThreadPreview(thread)}
                          </span>
                        </span>
                        <span className="text-[10px] font-bold uppercase text-zinc-600">
                          {formatThreadTime(thread.lastMessageAt)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredProfiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => openMember(profile)}
                  className="flex items-center gap-2 rounded-[4px] px-2 py-2 text-left text-sm font-bold text-zinc-200 hover:bg-blue-500/10 hover:text-white"
                >
                  <Image
                    src={profile.avatarUrl}
                    alt={`${profile.displayName} avatar`}
                    width={28}
                    height={28}
                    unoptimized
                    className="h-7 w-7 rounded-[4px] border border-blue-400/25 object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {profile.displayName}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[560px] flex-col bg-[#07101d]">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-blue-400/15 bg-black/25 px-4 py-3">
              <div>
                <h1 className="text-lg font-black text-blue-50">
                  {activeThread ? (
                    <Link
                      href={`/profile/${activeThread.member.username}`}
                      className="hover:text-blue-200"
                    >
                      {activeThread.member.name}
                    </Link>
                  ) : (
                    "Choose a member"
                  )}
                </h1>
                <p className="mt-1 text-xs text-zinc-500">
                  {activeThread
                    ? `Private messages with @${activeThread.member.username}`
                    : "Search members on the left to start a DM."}
                </p>
              </div>

              {activeThread && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleReportActiveMember}
                    className="rounded-[4px] border border-amber-300/35 bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-100 transition hover:border-amber-200"
                  >
                    Report
                  </button>
                  <button
                    type="button"
                    onClick={handleBlockActiveMember}
                    disabled={isActiveMemberBlocked}
                    className="rounded-[4px] border border-red-300/35 bg-red-500/10 px-3 py-1.5 text-xs font-black text-red-100 transition enabled:hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isActiveMemberBlocked ? "Blocked" : "Block"}
                  </button>
                </div>
              )}
            </header>

            <div ref={feedRef} className="flex-1 overflow-y-auto p-3">
              {activeThread?.messages.length ? (
                activeThread.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              ) : (
                <p className="py-16 text-center text-sm text-zinc-500">
                  No messages yet.
                </p>
              )}
            </div>

            {isGifSearchOpen && (
              <div className="border-t border-white/10 p-3">
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
                  <div className="mt-2 grid max-h-44 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5 md:grid-cols-7">
                    {gifResults.map((gif) => (
                      <button
                        key={gif.id}
                        type="button"
                        onClick={() => sendMessage(tenorGifToAttachment(gif))}
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

            <footer className="border-t border-blue-400/15 bg-black/35 p-3">
              {currentProfile ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
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
                    disabled={isActiveMemberBlocked}
                    className="chat-mini-tool"
                  >
                    GIF
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isActiveMemberBlocked}
                    className="chat-mini-tool"
                  >
                    Pic
                  </button>
                  <input
                    type="text"
                    value={draftMessage}
                    disabled={isSending || !activeThread || isActiveMemberBlocked}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    placeholder={
                      isActiveMemberBlocked
                        ? "You blocked this member."
                        : "Write a private message..."
                    }
                    className="min-w-0 flex-1 rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !activeThread || isActiveMemberBlocked}
                    className="rounded-[4px] border border-blue-400/45 bg-blue-500/15 px-3 py-2 text-xs font-black text-blue-100 disabled:opacity-60"
                  >
                    Send
                  </button>
                </form>
              ) : (
                <p className="text-sm text-zinc-500">Log in to send DMs.</p>
              )}
              {statusMessage && (
                <p className="mt-2 text-xs text-blue-100">{statusMessage}</p>
              )}
            </footer>
          </section>
        </section>
      </div>
    </main>
  );
}

function MessageBubble({ message }: { message: ChannelMessage }) {
  return (
    <article className="grid grid-cols-[32px_1fr_auto] gap-2 py-2 text-sm">
      <Image
        src={message.authorAvatarUrl || "/images/profile-avatar.svg"}
        alt={`${message.authorName} avatar`}
        width={32}
        height={32}
        unoptimized
        className="h-8 w-8 rounded-[4px] border border-blue-400/25 object-cover"
      />
      <div>
        <p>
          <Link
            href={`/profile/${message.authorUsername}`}
            className="font-black text-blue-300 hover:text-white"
          >
            @{message.authorName}
          </Link>{" "}
          {message.body}
        </p>
        {message.attachment && (
          <Image
            src={message.attachment.url}
            alt={message.attachment.label}
            width={260}
            height={180}
            unoptimized
            className="mt-2 max-h-56 rounded-[4px] border border-blue-400/20 object-cover"
          />
        )}
      </div>
      <span className="self-start rounded-[4px] bg-blue-50 px-1.5 py-1 text-[10px] font-bold text-blue-700">
        {message.createdAt}
      </span>
    </article>
  );
}

function ensureThread(
  threads: DirectMessageThread[],
  member: DirectMessageMember
) {
  if (threads.some((thread) => thread.member.id === member.id)) {
    return threads;
  }

  return [
    {
      id: `dm-${member.username}`,
      member,
      unread: 0,
      lastMessageAt: "",
      messages: [],
    },
    ...threads,
  ];
}

function mergeThreads(
  current: DirectMessageThread[],
  incoming: DirectMessageThread[]
) {
  const threadsByMember = new Map<string, DirectMessageThread>();

  current.forEach((thread) => {
    threadsByMember.set(thread.member.id, thread);
  });

  incoming.forEach((thread) => {
    threadsByMember.set(thread.member.id, thread);
  });

  return sortThreadsByActivity(Array.from(threadsByMember.values()));
}

function sortThreadsByActivity(threads: DirectMessageThread[]) {
  return [...threads].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

function getThreadPreview(thread: DirectMessageThread) {
  const lastMessage = thread.messages.at(-1);
  if (!lastMessage) return "No messages yet.";
  if (lastMessage.attachment && !lastMessage.body) {
    return lastMessage.attachment.label;
  }
  return lastMessage.body;
}

function formatThreadTime(value: string) {
  if (!value) return "";

  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(createdAt);
}
