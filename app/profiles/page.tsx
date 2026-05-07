import Image from "next/image";
import Link from "next/link";
import { getProfilesFromSupabase } from "../../lib/profiles";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const profiles = await loadProfiles();

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hub"
            className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
          >
            Back to Hub
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="hub-nav-link" href="/discussions">
              Discussions
            </Link>
            <Link className="hub-nav-link" href="/events">
              Schedule
            </Link>
            <Link className="hub-nav-link" href="/store">
              Store
            </Link>
            <Link className="hub-nav-link" href="/login">
              Login
            </Link>
          </div>
        </nav>

        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Profile
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Wanderer Profiles
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            Member identities from Supabase. New accounts will appear here
            after signup creates their profile record.
          </p>
          <Link
            href="/join/create"
            className="mt-5 inline-flex rounded-full border border-blue-400/45 bg-blue-500/15 px-5 py-3 text-sm font-bold text-blue-100"
          >
            Create Account
          </Link>
        </section>

        {profiles.length === 0 ? (
          <section className="mt-5 rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-bold text-white">No profiles yet</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Create your account first, then refresh this page after Supabase
              creates the profile row.
            </p>
          </section>
        ) : (
          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.username}`}
              className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04] transition hover:border-blue-400/35 hover:bg-white/[0.06]"
            >
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
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {profile.displayName}
                    </h2>
                    <p className="text-sm text-zinc-500">@{profile.username}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-400">
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
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

async function loadProfiles() {
  try {
    return await getProfilesFromSupabase();
  } catch {
    return [];
  }
}
