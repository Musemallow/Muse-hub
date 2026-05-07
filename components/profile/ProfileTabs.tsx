"use client";

import { useState } from "react";

const tabs = ["Posts", "Clips", "Audio", "Store", "Membership"] as const;
type Tab = (typeof tabs)[number];

const tabCopy: Record<Tab, string> = {
  Posts:
    "This is where creator posts will appear. Members can comment, but posting stays owner-only.",
  Clips:
    "A future grid for stream clips, highlights, and short-form video drops.",
  Audio:
    "A place for audio uploads, voice posts, music snippets, and future member media.",
  Store:
    "Store items can preview here and link out to the right external shop.",
  Membership:
    "Supporter-only sneak peeks, WIPs, and gated sections can live here later.",
};

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("Posts");

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

      <div className="mt-5 rounded-[8px] border border-dashed border-blue-400/20 bg-black/30 p-6">
        <h2 className="text-lg font-semibold text-white">{activeTab}</h2>
        <p className="mt-2 text-sm leading-7 text-zinc-400">
          {tabCopy[activeTab]}
        </p>
      </div>
    </section>
  );
}
