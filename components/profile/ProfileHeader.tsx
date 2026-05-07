import Image from "next/image";
import { Profile } from "../../types/profile";

type ProfileHeaderProps = {
  profile: Profile;
  onEdit?: () => void;
};

export default function ProfileHeader({
  profile,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-blue-400/15 bg-black/45 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="relative h-48 w-full sm:h-60 md:h-72">
        <Image
          src={profile.bannerUrl}
          alt={`${profile.displayName} banner`}
          fill
          className="object-cover object-[50%_38%]"
          priority
        />
        <div className="profile-hero-overlay absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.86),rgba(0,0,0,0.35)_58%,transparent)]" />
      </div>

      <div className="relative px-4 pb-6 sm:px-6 md:px-8">
        <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 md:-mt-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative h-28 w-28 overflow-hidden rounded-[8px] border border-blue-300/55 bg-zinc-950 shadow-[0_0_24px_rgba(37,99,235,0.2)] sm:h-32 sm:w-32 md:h-40 md:w-40">
                <Image
                  src={profile.avatarUrl}
                  alt={`${profile.displayName} avatar`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm uppercase tracking-[0.28em] text-blue-200/75">
                    @{profile.username}
                  </p>
                  <span className="rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                    {profile.membership.tier === "premium"
                      ? "Premium"
                      : "Free"}
                  </span>
                </div>
                <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                  {profile.displayName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                  {profile.status}
                </p>
              </div>
            </div>

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:border-blue-200 hover:bg-blue-500/20 hover:text-white"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ProfileStat label="Posts" value={profile.stats.posts} />
            <ProfileStat label="Clips" value={profile.stats.clips} />
            <ProfileStat label="Supporters" value={profile.stats.supporters} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
