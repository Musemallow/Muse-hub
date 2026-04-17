import { ProfileData } from "../../data/mockProfile";

type ProfileSidebarProps = {
  profile: ProfileData;
};

export default function ProfileSidebar({ profile }: ProfileSidebarProps) {
  return (
    <aside className="space-y-6">
      <section className="rounded-[24px] border border-cyan-400/15 bg-black/40 p-5 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
          About
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-300">{profile.bio}</p>
      </section>

      <section className="rounded-[24px] border border-cyan-400/15 bg-black/40 p-5 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
          Contact
        </p>

        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              MuseHub ID
            </p>
            <p className="mt-1 text-white">@{profile.username}</p>
          </div>

          {profile.discord && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Discord
              </p>
              <p className="mt-1 text-white">{profile.discord}</p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-cyan-400/15 bg-black/40 p-5 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
          Weekly Schedule
        </p>

        <div className="mt-4 space-y-3">
          {profile.schedule.map((item) => (
            <div
              key={`${item.day}-${item.time}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.day}</p>
                  <p className="text-xs text-zinc-400">{item.label}</p>
                </div>
                <p className="text-sm text-cyan-200">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}