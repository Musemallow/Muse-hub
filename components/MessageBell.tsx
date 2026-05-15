"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "../lib/notifications";
import { getCurrentProfileFromSupabase } from "../lib/profiles";
import { getSupabaseClient } from "../lib/supabase";

export default function MessageBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | undefined;

    async function loadBell() {
      try {
        const profile = await getCurrentProfileFromSupabase();
        if (!isMounted) return;

        setIsLoggedIn(Boolean(profile));

        if (!profile) return;

        setUnreadCount(
          await getUnreadNotificationCount([
            "direct_message",
            "discussion_mention",
          ])
        );

        const supabase = getSupabaseClient();
        const channel = supabase
          .channel(`musehub-message-bell-${profile.id}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications" },
            async () => {
              const count = await getUnreadNotificationCount([
                "direct_message",
                "discussion_mention",
              ]);
              setUnreadCount(count);
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "notifications" },
            async () => {
              const count = await getUnreadNotificationCount([
                "direct_message",
                "discussion_mention",
              ]);
              setUnreadCount(count);
            }
          )
          .subscribe();

        subscription = { unsubscribe: () => supabase.removeChannel(channel) };
      } catch {
        if (isMounted) {
          setIsLoggedIn(false);
        }
      }
    }

    loadBell();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (!isLoggedIn) return null;

  return (
    <Link
      href="/messages"
      className="fixed right-4 top-4 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full border border-blue-400/35 bg-[#050811]/95 text-blue-100 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-blue-200 hover:text-white"
      aria-label="Direct messages"
      title="Direct messages"
    >
      <EnvelopeIcon />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-blue-400 px-1.5 py-0.5 text-center text-[10px] font-black text-black">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
