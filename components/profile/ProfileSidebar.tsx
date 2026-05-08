import { Profile } from "../../types/profile";
import MembershipCard from "./MembershipCard";
import { ReactNode } from "react";

type ProfileSidebarProps = {
  profile: Profile;
  onClaimDailyCheckin?: () => void;
  isClaimingDailyCheckin?: boolean;
};

export default function ProfileSidebar({
  profile,
  onClaimDailyCheckin,
  isClaimingDailyCheckin = false,
}: ProfileSidebarProps) {
  return (
    <aside className="space-y-6">
      <MembershipCard profile={profile} />

      {onClaimDailyCheckin && (
        <ProfilePanel eyebrow="Economy">
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-black text-white">{profile.points}</p>
              <p className="mt-1 text-sm text-zinc-400">Current points</p>
            </div>
            <button
              type="button"
              onClick={onClaimDailyCheckin}
              disabled={isClaimingDailyCheckin}
              className="w-full rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
            >
              {isClaimingDailyCheckin ? "Checking In..." : "Daily Check-In"}
            </button>
          </div>
        </ProfilePanel>
      )}

      <ProfilePanel eyebrow="About">
        <p className="text-sm leading-7 text-zinc-300">{profile.bio}</p>
      </ProfilePanel>

      <ProfilePanel eyebrow="Contact">
        <div className="space-y-3 text-sm text-zinc-300">
          <ProfileDetail label="MuseHub ID" value={`@${profile.username}`} />

          {profile.showBirthdate && profile.birthdate && (
            <ProfileDetail label="Birthdate" value={formatBirthdate(profile.birthdate)} />
          )}

          <SocialLinks profile={profile} />

          <ProfileDetail label="Points" value={String(profile.points)} />
        </div>
      </ProfilePanel>

      {profile.schedule.length > 0 && (
        <ProfilePanel eyebrow="Weekly Schedule">
          <div className="space-y-3">
            {profile.schedule.map((item) => (
              <div
                key={`${item.day}-${item.time}`}
                className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.day}
                    </p>
                    <p className="text-xs text-zinc-400">{item.label}</p>
                  </div>
                  <p className="text-sm text-blue-100">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ProfilePanel>
      )}
    </aside>
  );
}

function ProfilePanel({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-blue-400/15 bg-black/40 p-5 backdrop-blur-md">
      <p className="mb-3 text-xs uppercase tracking-[0.28em] text-blue-300/75">
        {eyebrow}
      </p>
      {children}
    </section>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  );
}

function SocialLinks({ profile }: { profile: Profile }) {
  const links = profile.socialLinks ?? {};
  const socialItems = [
    { label: "Twitch", value: links.twitch, href: toSocialUrl("twitch", links.twitch) },
    { label: "X", value: links.x, href: toSocialUrl("x", links.x) },
    { label: "BSKY", value: links.bsky, href: toSocialUrl("bsky", links.bsky) },
    { label: "Instagram", value: links.instagram, href: toSocialUrl("instagram", links.instagram) },
    { label: "YouTube", value: links.youtube, href: toSocialUrl("youtube", links.youtube) },
  ].filter((item) => item.value);

  return (
    <>
      {socialItems.map((item) => (
        <div key={item.label}>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            {item.label}
          </p>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex text-blue-100 transition hover:text-white"
          >
            {item.label}
          </a>
        </div>
      ))}

      {links.discord && (
        <ProfileDetail label="Discord" value={links.discord} />
      )}
    </>
  );
}

function toSocialUrl(platform: string, value = "") {
  const cleanValue = value.trim();
  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue;
  }

  const handle = cleanValue.replace(/^@/, "");

  if (platform === "twitch") return `https://twitch.tv/${handle}`;
  if (platform === "x") return `https://x.com/${handle}`;
  if (platform === "bsky") return `https://bsky.app/profile/${handle}`;
  if (platform === "instagram") return `https://instagram.com/${handle}`;
  if (platform === "youtube") {
    return cleanValue.startsWith("@")
      ? `https://youtube.com/${cleanValue}`
      : `https://youtube.com/@${handle}`;
  }

  return cleanValue;
}

function formatBirthdate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
