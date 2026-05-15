"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthNavLink from "../../components/AuthNavLink";
import {
  getCurrentNotifications,
  markNotificationRead,
  MuseNotification,
} from "../../lib/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<MuseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        const loadedNotifications = await getCurrentNotifications();

        if (isMounted) {
          setNotifications(loadedNotifications);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load notifications."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleOpenNotification(notification: MuseNotification) {
    if (!notification.isRead) {
      await markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
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
          <div className="flex flex-wrap gap-2">
            <Link className="hub-nav-link" href="/discussions">
              Chat
            </Link>
            <Link className="hub-nav-link" href="/profiles">
              Members
            </Link>
            <AuthNavLink />
          </div>
        </nav>

        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Notifications
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Signal Inbox
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            Messages, owner posts, and future live alerts collect here first.
          </p>
        </section>

        <section className="mt-5 grid gap-3">
          {isLoading && (
            <p className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-400">
              Loading notifications...
            </p>
          )}

          {errorMessage && (
            <p className="rounded-[8px] border border-red-400/40 bg-red-500/10 p-5 text-sm text-red-100">
              {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && notifications.length === 0 && (
            <p className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-400">
              No notifications yet.
            </p>
          )}

          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.href}
              onClick={() => handleOpenNotification(notification)}
              className={`rounded-[8px] border p-5 transition hover:border-blue-400/40 ${
                notification.isRead
                  ? "border-white/10 bg-white/[0.035]"
                  : "border-blue-400/35 bg-blue-500/10"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-200/75">
                    {notification.actorName}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-white">
                    {notification.title}
                  </h2>
                </div>
                <p className="text-xs text-zinc-500">
                  {notification.createdAt}
                </p>
              </div>
              {notification.body && (
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {notification.body}
                </p>
              )}
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
