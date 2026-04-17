import Image from "next/image";
import { Profile } from "../../data/mockProfile";

type ProfileHeaderProps = {
  profile: Profile;
  onEdit?: () => void;
};

export default function ProfileHeader({
  profile,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-cyan-400/20 bg-black/40 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
      <div className="relative h-48 w-full sm:h-60 md:h-72">
        <Image
          src={profile.bannerUrl}
          alt={`${profile.displayName} banner`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="relative px-4 pb-6 sm:px-6 md:px-8">
        <div className="-mt-16 flex flex-col gap-4 sm:-mt-20 md:-mt-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative h-28 w-28 overflow-hidden rounded-[24px] border-4 border-cyan-300/70 bg-zinc-900 shadow-[0_0_24px_rgba(34,211,238,0.25)] sm:h-32 sm:w-32 md:h-40 md:w-40">
                <Image
                  src={profile.avatarUrl}
                  alt={`${profile.displayName} avatar`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="pb-1">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">
                  @{profile.username}
                </p>
                <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                  {profile.displayName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-300 sm:text-base">
                  {profile.status}
                </p>
              </div>
            </div>

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20 hover:text-white"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                Posts
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {profile.stats.posts}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                Clips
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {profile.stats.clips}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                Supporters
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {profile.stats.supporters}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}