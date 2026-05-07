import Image from "next/image";
import Link from "next/link";
import { storeDrops } from "../../data/landingContent";

export default function StorePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TopLinks />

        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Store
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Drops And Perks
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            A home for merch, digital packs, member perks, and seasonal MuseHub
            items. Product cards show pictures and details here, then send
            wanderers to the external platform that handles checkout.
          </p>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {storeDrops.map((drop) => (
            <a
              key={drop.id}
              href={drop.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-[8px] border border-white/10">
                <Image
                  src={drop.imageUrl}
                  alt={drop.title}
                  fill
                  className="object-cover"
                />
                <div className="media-card-overlay absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.54),transparent_58%)]" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  {drop.status}
                </span>
                <span className="text-sm font-semibold text-blue-100">
                  {drop.price}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">
                {drop.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {drop.description}
              </p>
              <span className="mt-5 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100">
                Open Link
              </span>
            </a>
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
        <Link className="hub-nav-link" href="/events">
          Schedule
        </Link>
        <Link className="hub-nav-link" href="/discussions">
          Discussions
        </Link>
        <Link className="hub-nav-link" href="/profile">
          Profile
        </Link>
        <Link className="hub-nav-link" href="/login">
          Login
        </Link>
      </div>
    </nav>
  );
}
