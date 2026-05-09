import { Profile } from "../../types/profile";
import { getProfilePermissions } from "../../lib/profilePermissions";

type MembershipCardProps = {
  profile: Profile;
};

export default function MembershipCard({ profile }: MembershipCardProps) {
  const tierLabel = getMembershipTierLabel(profile.membership.tier);
  const roleLabel = getRoleLabel(profile.role);
  const permissions = getProfilePermissions(profile);

  return (
    <section
      className="overflow-hidden rounded-[8px] border border-blue-300/45 bg-[linear-gradient(135deg,rgba(3,6,14,0.98),rgba(17,24,39,0.95)_42%,rgba(20,59,142,0.62)_76%,rgba(2,3,9,0.98))] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.28),0_0_36px_rgba(37,99,235,0.18)]"
    >
      <div className="relative overflow-hidden rounded-[8px] border border-white/10 bg-black/50">
        <div className="relative aspect-[16/9] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85"
            style={{ backgroundImage: `url(${profile.bannerUrl})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.96),rgba(0,0,0,0.38)_58%,rgba(0,0,0,0.12))]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white">
                Membership
              </p>
              <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-blue-100">
                {profile.displayName} / @{profile.username}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-blue-200/50 bg-blue-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-50">
              {tierLabel}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-blue-200/75">
              Muse Network // Authorized User
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase text-white">
              Stability Unknown
            </h2>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <MembershipDetail label="Sync Points" value={String(profile.points)} />
              <MembershipDetail label="Join Date" value={profile.membership.memberSince} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MembershipDetail label="Membership Level" value={tierLabel} />
              <MembershipDetail label="Authority" value={roleLabel} />
            </div>
            <MembershipDetail label="Card ID" value={profile.membership.cardId} />
          </div>

          <div className="rounded-[8px] border border-white/10 bg-black/35 px-4 py-3">
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
              <AccessRow
                label="Moderation"
                value={permissions.canModerate ? "Enabled" : "Locked"}
              />
            </div>
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

function getMembershipTierLabel(tier: Profile["membership"]["tier"]) {
  if (tier === "tier_1") return "Witness";
  if (tier === "tier_2") return "Signal Infected";
  if (tier === "tier_3") return "Anomaly";
  return "Wanderer";
}

function getRoleLabel(role: Profile["role"]) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  if (role === "moderator") return "Moderator";
  return "Member";
}
