export default function Home() {
  return (
    <main className="min-h-screen bg-[#020409] text-white relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_top_left,rgba(96,165,250,0.10),transparent_25%),linear-gradient(to_bottom,#020409,#030712,#020409)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4 lg:flex-row">
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-[360px] shrink-0">
          <div className="overflow-hidden rounded-[28px] border border-blue-500/20 bg-black/60 shadow-[0_0_40px_rgba(59,130,246,0.12)] backdrop-blur-xl">
            <div className="relative h-36 w-full overflow-hidden border-b border-blue-400/10 bg-[linear-gradient(135deg,#07111f,#0b1730,#07111f)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_35%)]" />
            </div>

            <div className="px-5 pb-5">
              <div className="-mt-10 flex items-end gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-blue-400/40 bg-[#08101d] shadow-[0_0_25px_rgba(59,130,246,0.25)]">
                  <img
                    src="/logo.png"
                    alt="Musemallow Logo"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="pb-2">
                  <div className="text-3xl font-bold tracking-tight text-white">
                    Musemallow
                  </div>
                  <div className="text-sm text-blue-200/70">@musemallowtv</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.18)] transition hover:bg-blue-500/20">
                  Schedule
                </button>
                <button className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.18)] transition hover:bg-blue-500/20">
                  Projects
                </button>
                <button className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.18)] transition hover:bg-blue-500/20">
                  Contact
                </button>
              </div>

              <section className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/45">
                  Status
                </p>
                <div className="rounded-2xl border border-blue-400/15 bg-[#050913] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="relative inline-flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/50" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-400" />
                    </span>
                    <span className="text-sm font-medium text-blue-100">
                      Twitch Live Monitor
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-blue-100/55">
                    Live status integration coming next.
                  </p>
                </div>
              </section>

              <section className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/45">
                  Links
                </p>

                <div className="space-y-3">
                  {[
                    ["Twitch", "twitch.tv/musemallow"],
                    ["X", "x.com/musemallowtv"],
                    ["YouTube", "youtube.com/@MuseMallow"],
                    ["Discord", "discord.gg/forestofmuse"],
                  ].map(([title, value]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-blue-400/15 bg-[#050913] px-4 py-4 transition hover:border-blue-400/30 hover:bg-blue-500/[0.06]"
                    >
                      <div className="text-base font-semibold text-white">{title}</div>
                      <div className="text-sm text-blue-100/60">{value}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-blue-400/15 bg-black/60 p-6 shadow-[0_0_40px_rgba(59,130,246,0.10)] backdrop-blur-xl">
              <h1 className="text-4xl font-black uppercase tracking-tight text-[#7dd3fc] md:text-6xl">
                Musemallow
              </h1>
              <p className="mt-3 text-sm uppercase tracking-[0.18em] text-blue-100/70">
                I stream • I build cool things • I share them here
              </p>
              <p className="mt-2 text-sm font-medium text-blue-300">
                Click a project to jump to its section
              </p>
            </div>

            <div className="rounded-[28px] border border-blue-400/15 bg-black/60 p-4 shadow-[0_0_40px_rgba(59,130,246,0.10)] backdrop-blur-xl">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Starfall TTRPG", "25%", "System + sheet polish / ongoing rebuild"],
                  ["Scheduler Carrd Widget", "80%", "Live status glow + weekly layout"],
                  ["Reminder Asset", "80%", "Reusable reminder panel + branding pass"],
                  ["Magic Cyberpunk TTRPG", "10%", "Core rules scaffolding + magic integration"],
                ].map(([title, pct, body]) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-blue-400/15 bg-[#040812] p-5 transition hover:border-blue-400/30 hover:shadow-[0_0_28px_rgba(59,130,246,0.14)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl font-bold text-white">{title}</h2>
                      <span className="text-2xl font-black text-blue-300">{pct}</span>
                    </div>
                    <p className="mt-2 text-sm text-blue-100/60">{body}</p>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#3b82f6,#60a5fa,#93c5fd)] shadow-[0_0_18px_rgba(96,165,250,0.5)]"
                        style={{
                          width: pct,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="rounded-full border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.16)] transition hover:bg-blue-500/20">
                  Go to schedule
                </button>
                <button className="rounded-full border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.16)] transition hover:bg-blue-500/20">
                  See project board
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}