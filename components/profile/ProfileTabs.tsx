"use client";

import { useEffect, useState } from "react";
import {
  getProfileCommentActivity,
  ProfileCommentActivity,
} from "../../lib/profileActivity";

const tabs = ["Posts", "Activity", "Clips", "Audio", "Store", "Membership"] as const;
type Tab = (typeof tabs)[number];

const tabCopy: Record<Tab, string> = {
  Posts:
    "This is where creator posts will appear. Members can comment, but posting stays owner-only.",
  Activity:
    "Recent comments left on MuseMallow posts will appear here once the alpha content tables are live.",
  Clips:
    "A future grid for stream clips, highlights, and short-form video drops.",
  Audio:
    "A place for audio uploads, voice posts, music snippets, and future member media.",
  Store:
    "Store items can preview here and link out to the right external shop.",
  Membership:
    "Supporter-only sneak peeks, WIPs, and gated sections can live here later.",
};

export default function ProfileTabs({ profileId }: { profileId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("Posts");
  const [activity, setActivity] = useState<ProfileCommentActivity[]>([]);
  const [activityStatus, setActivityStatus] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadActivity() {
      if (activeTab !== "Activity") return;

      setActivityStatus("Loading activity...");

      try {
        const comments = await getProfileCommentActivity(profileId);
        if (!isMounted) return;

        setActivity(comments);
        setActivityStatus(
          comments.length === 0 ? "No public comment activity yet." : ""
        );
      } catch {
        if (isMounted) {
          setActivity([]);
          setActivityStatus("Activity unlocks after the alpha content tables are live.");
        }
      }
    }

    loadActivity();

    return () => {
      isMounted = false;
    };
  }, [activeTab, profileId]);

  return (
    <section className="rounded-[8px] border border-blue-400/15 bg-black/40 p-4 backdrop-blur-md sm:p-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-blue-300/50 bg-blue-500/15 text-blue-100 shadow-[0_0_16px_rgba(37,99,235,0.14)]"
                  : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-blue-400/25 hover:text-white"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {activeTab === "Activity" ? (
        <ActivityPanel activity={activity} status={activityStatus} />
      ) : (
        <div className="mt-5 rounded-[8px] border border-dashed border-blue-400/20 bg-black/30 p-6">
          <h2 className="text-lg font-semibold text-white">{activeTab}</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">
            {tabCopy[activeTab]}
          </p>
        </div>
      )}
    </section>
  );
}

function ActivityPanel({
  activity,
  status,
}: {
  activity: ProfileCommentActivity[];
  status: string;
}) {
  return (
    <div className="mt-5 rounded-[8px] border border-blue-400/15 bg-black/30 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-white">Activity</h2>
      {status && (
        <p className="mt-2 text-sm leading-7 text-zinc-400">{status}</p>
      )}

      {activity.length > 0 && (
        <div className="mt-4 grid gap-3">
          {activity.map((item) => (
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
                {formatActivityDate(item.createdAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
