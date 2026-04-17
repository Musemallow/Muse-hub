"use client";

import { useState } from "react";

const tabs = ["Posts", "Clips", "Audio", "Store", "Membership"] as const;
type Tab = (typeof tabs)[number];

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("Posts");

  return (
    <section className="rounded-[24px] border border-cyan-400/15 bg-black/40 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border border-cyan-300/50 bg-cyan-400/15 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.14)]"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:border-cyan-400/25 hover:text-white"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[20px] border border-dashed border-cyan-400/20 bg-black/30 p-6">
        {activeTab === "Posts" && (
          <div>
            <h2 className="text-lg font-semibold text-white">Posts</h2>
            <p className="mt-2 text-sm text-zinc-400">
              This is where profile posts will appear. Later this can pull from
              your real post database and filter to this creator only.
            </p>
          </div>
        )}

        {activeTab === "Clips" && (
          <div>
            <h2 className="text-lg font-semibold text-white">Clips</h2>
            <p className="mt-2 text-sm text-zinc-400">
              This section can become a grid of stream clips or highlighted
              short-form videos.
            </p>
          </div>
        )}

        {activeTab === "Audio" && (
          <div>
            <h2 className="text-lg font-semibold text-white">Audio</h2>
            <p className="mt-2 text-sm text-zinc-400">
              This will hold audio uploads, voice posts, or music snippets.
            </p>
          </div>
        )}

        {activeTab === "Store" && (
          <div>
            <h2 className="text-lg font-semibold text-white">Store</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Future storefront section for merch, digital products, or special
              creator items.
            </p>
          </div>
        )}

        {activeTab === "Membership" && (
          <div>
            <h2 className="text-lg font-semibold text-white">Membership</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Future supporter-only section for sneak peeks, WIPs, or exclusive
              content.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}