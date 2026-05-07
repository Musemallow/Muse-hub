import { Profile } from "../../types/profile";
import { getProfilePermissions } from "../../lib/profilePermissions";

type MembershipCardProps = {
  profile: Profile;
};

export default function MembershipCard({ profile }: MembershipCardProps) {
  const isPremium = profile.membership.tier === "premium";
  const permissions = getProfilePermissions(profile);

  return (
    <section
      className={`overflow-hidden rounded-[8px] border p-5 shadow-[0_18px_38px_rgba(0,0,0,0.22)] ${
        isPremium
          ? "border-blue-400/40 bg-[linear-gradient(135deg,rgba(5,8,17,0.96),rgba(30,64,175,0.42)_52%,rgba(2,3,9,0.96))]"
          : "border-white/10 bg-black/45"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-blue-200/75">
            MuseHub Card
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            {isPremium ? "Premium Member" : "Free Member"}
          </h2>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
            isPremium
              ? "border-blue-300/50 bg-blue-500/15 text-blue-100"
              : "border-white/10 bg-white/[0.04] text-zinc-300"
          }`}
        >
          {profile.membership.tier}
        </span>
      </div>

      <div className="mt-8 grid gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
            Holder
          </p>
          <p className="mt-1 text-white">
            {profile.displayName} / @{profile.username}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MembershipDetail
            label="Since"
            value={profile.membership.memberSince}
          />
          <MembershipDetail label="Card ID" value={profile.membership.cardId} />
        </div>

        <div className="rounded-[8px] border border-white/10 bg-black/25 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-300">Points</span>
            <span className="font-semibold text-white">{profile.points}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-zinc-300">Theme</span>
            <span className="font-semibold uppercase text-white">
              {profile.themeMode}
            </span>
          </div>
          {isPremium && profile.membership.renewalDate && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-zinc-300">Renews</span>
              <span className="font-semibold text-white">
                {profile.membership.renewalDate}
              </span>
            </div>
          )}
        </div>

        <div className="rounded-[8px] border border-white/10 bg-black/25 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
            Access
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <AccessRow
              label="Posts"
              value={permissions.canPost ? "Enabled" : "Locked"}
            />
            <AccessRow
              label="Messages"
              value={permissions.canMessage ? "Enabled" : "Locked"}
            />
            <AccessRow
              label="Comments"
              value={permissions.canComment ? "GIFs + Images" : "Locked"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MembershipDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  );
}

function AccessRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-300">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
