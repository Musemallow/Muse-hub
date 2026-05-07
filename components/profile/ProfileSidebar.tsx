import { Profile } from "../../types/profile";
import MembershipCard from "./MembershipCard";
import { ReactNode } from "react";

type ProfileSidebarProps = {
  profile: Profile;
};

export default function ProfileSidebar({ profile }: ProfileSidebarProps) {
  return (
    <aside className="space-y-6">
      <MembershipCard profile={profile} />

      <ProfilePanel eyebrow="About">
        <p className="text-sm leading-7 text-zinc-300">{profile.bio}</p>
      </ProfilePanel>

      <ProfilePanel eyebrow="Contact">
        <div className="space-y-3 text-sm text-zinc-300">
          <ProfileDetail label="MuseHub ID" value={`@${profile.username}`} />

          {profile.socialHandle && (
            <ProfileDetail label="Social" value={profile.socialHandle} />
          )}

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
