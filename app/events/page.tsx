import Link from "next/link";
import AuthNavLink from "../../components/AuthNavLink";
import { getSiteContent } from "../../lib/siteContent";

export default async function EventsPage() {
  const siteContent = await getSiteContent();

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TopLinks />

        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Schedule
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Upcoming Signals
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            Stream schedule, community nights, and future live alerts will live
            here. For now, this mirrors the planned weekly event rhythm.
          </p>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {siteContent.events.map((event) => (
            <article
              key={event.id}
              className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-blue-200/75">
                {event.date}
              </p>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {event.title}
              </h2>
              <dl className="mt-5 grid gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Time
                  </dt>
                  <dd className="mt-1 text-zinc-200">{event.time}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Location
                  </dt>
                  <dd className="mt-1 text-zinc-200">{event.location}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function TopLinks() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3">
      <Link
        href="/hub"
        className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
      >
        Back to Hub
      </Link>
      <div className="flex flex-wrap gap-2">
        <Link className="hub-nav-link" href="/store">
          Store
        </Link>
        <Link className="hub-nav-link" href="/discussions">
          Discussions
        </Link>
        <Link className="hub-nav-link" href="/profile">
          Profile
        </Link>
        <AuthNavLink />
      </div>
    </nav>
  );
}
