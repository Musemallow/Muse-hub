"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Profile } from "../../types/profile";

type ProfileSearchProps = {
  profiles: Profile[];
};

export default function ProfileSearch({ profiles }: ProfileSearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProfiles = useMemo(() => {
    if (!normalizedQuery) return profiles;

    return profiles.filter((profile) =>
      [
        profile.displayName,
        profile.username,
        profile.status,
        profile.bio,
        profile.membership.tier,
        profile.role,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [normalizedQuery, profiles]);

  return (
    <section className="mt-5">
      <div className="rounded-[8px] border border-blue-400/15 bg-white/[0.04] p-4">
        <label
          htmlFor="member-search"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200/75"
        >
          Member Search
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="member-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search names, @handles, bios, or tiers..."
            className="min-w-0 flex-1 rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-300/55"
          />
          <div className="rounded-[8px] border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-zinc-300">
            {filteredProfiles.length} / {profiles.length}
          </div>
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="mt-5 rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-bold text-white">No matches</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">
            Try a display name, username, role, or membership tier.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <article
              key={profile.id}
              className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04] transition hover:border-blue-400/35 hover:bg-white/[0.06]"
            >
              <Link href={`/profile/${profile.username}`} className="block">
                <div className="relative aspect-[16/8] border-b border-white/10">
                  <Image
                    src={profile.bannerUrl}
                    alt={`${profile.displayName} banner`}
                    fill
                    className="object-cover object-[50%_38%]"
                  />
                  <div className="media-card-overlay absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.74),transparent_68%)]" />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-[8px] border border-blue-400/25 bg-blue-500/10">
                      <Image
                        src={profile.avatarUrl}
                        alt={`${profile.displayName} avatar`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-white">
                        {profile.displayName}
                      </h2>
                      <p className="truncate text-sm text-zinc-500">
                        @{profile.username}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-400">
                    {profile.status}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                      {profile.membership.tier}
                    </span>
                    {profile.isCreator && (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
                        owner
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="border-t border-white/10 px-5 py-4">
                <Link
                  href={`/discussions?dm=${encodeURIComponent(profile.username)}`}
                  className="inline-flex w-full justify-center rounded-full border border-cyan-300/35 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-500/20"
                >
                  DM @{profile.username}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
