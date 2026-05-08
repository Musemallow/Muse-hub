import Image from "next/image";
import Link from "next/link";
import FeedPostCard from "../../components/FeedPostCard";
import {
  landingUpdates,
  storeDrops,
  upcomingEvents,
} from "../../data/landingContent";
import { discussionCategories } from "../../data/discussionThreads";
import { getLatestPosts } from "../../lib/posts";
import "../entrance.css";

const creatorOverview = {
  bannerUrl: "/images/musemallow-banner.jpeg",
  membershipTier: "premium",
  points: 1460,
};

export default async function HubPage() {
  const latestChannel =
    discussionCategories
      .flatMap((category) => category.channels)
      .find((channel) => channel.id === "general-chat") ??
    discussionCategories[0].channels[0];
  const latestMessage = latestChannel.messages[0];
  const latestPosts = await getHubPosts();

  return (
    <main className="landing-page min-h-screen bg-[#020309] text-white">
      <section className="landing-hero relative flex min-h-[92vh] items-end overflow-hidden px-4 pb-10 pt-44 sm:px-6 sm:pt-36 lg:px-8 lg:pt-36">
        <Image
          src={creatorOverview.bannerUrl}
          alt="MuseMallow forest banner"
          fill
          priority
          className="object-cover object-[50%_38%]"
        />
        <div className="hub-hero-overlay absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.26),rgba(0,0,0,0.7)_58%,#020309_100%)]" />
        <div className="forest-beam" />

        <nav className="absolute left-0 right-0 top-0 z-20 px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 rounded-[8px] border border-blue-400/15 bg-black/70 px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200"
            >
              MuseHub
            </Link>
            <div className="flex w-full flex-wrap gap-2 text-sm sm:w-auto sm:justify-end">
              <Link className="hub-nav-link" href="/events">
                Schedule
              </Link>
              <Link className="hub-nav-link" href="/discussions">
                Discussions
              </Link>
              <Link className="hub-nav-link" href="/store">
                Store
              </Link>
              <Link className="hub-nav-link" href="/profile">
                Profile
              </Link>
              <Link className="hub-nav-link" href="/login">
                Login
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="max-w-3xl">
            <Image
              src="/Logo.png"
              alt="Musemallow Logo"
              width={4000}
              height={2500}
              priority
              className="logo-image mb-5 h-auto w-[180px] select-none sm:w-[240px] md:w-[300px]"
              draggable="false"
            />
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200/80">
              Welcome to The Forest
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              MuseMallow
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg">
              Current posts, store drops, schedule notes, and member access for
              the MuseHub community.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="#latest-posts"
                className="inline-flex justify-center rounded-full border border-blue-400/60 bg-blue-500/15 px-5 py-3 text-sm font-semibold text-blue-100 shadow-[0_0_22px_rgba(37,99,235,0.22)] transition hover:border-blue-200 hover:bg-blue-500/25"
              >
                Latest Posts
              </Link>
              <Link
                href="/events"
                className="inline-flex justify-center rounded-full border border-white/15 bg-black/35 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-400/45"
              >
                Schedule
              </Link>
              <Link
                href="/store"
                className="inline-flex justify-center rounded-full border border-white/15 bg-black/35 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-400/45"
              >
                Store Drops
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-[8px] border border-blue-400/15 bg-black/60 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-1">
            <HubStat label="Member" value={creatorOverview.membershipTier} />
            <HubStat label="Points" value={String(creatorOverview.points)} />
            <HubStat label="Next Event" value="Sunday / 8 PM" />
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <section id="latest-posts">
            <SectionHeading eyebrow="Posts" title="Latest From MuseMallow" />
            <div className="mt-5 grid gap-4">
              {latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <FeedPostCard key={post.id} post={post} compact />
                ))
              ) : (
                landingUpdates.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={post.href}
                    className="rounded-[8px] border border-blue-400/15 bg-[#050811]/90 p-5 shadow-[0_18px_38px_rgba(0,0,0,0.22)] transition hover:border-blue-400/40 hover:bg-[#07101d]"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-blue-400/35 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                        {post.label}
                      </span>
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        {post.date}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-white">
                      {post.title}
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">
                      {post.summary}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Schedule" title="Coming Up" />
            <div className="mt-5 grid gap-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href="/events"
                  className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4 transition hover:border-blue-400/30 hover:bg-white/[0.055]"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-200/75">
                    {event.date}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">
                    {event.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-400">
                    <span>{event.time}</span>
                    <span>/</span>
                    <span>{event.location}</span>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/discussions"
              className="mt-4 block rounded-[8px] border border-blue-400/15 bg-[#050811]/90 p-4 shadow-[0_18px_38px_rgba(0,0,0,0.2)] transition hover:border-blue-400/40 hover:bg-[#07101d]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
                  Latest Channel
                </p>
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Signal rooms
                </span>
              </div>

              <h3 className="mt-3 text-lg font-bold text-white">
                <span className="text-zinc-500">#</span> {latestChannel.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {latestChannel.description}
              </p>

              {latestMessage && (
                <div className="mt-4 rounded-[8px] border border-white/10 bg-black/35 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      {latestMessage.authorName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {latestMessage.createdAt}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {latestMessage.body}
                  </p>
                </div>
              )}
            </Link>
          </section>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#03050d] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Store" title="Drops And Perks" />
            <Link
              href="/store"
              className="text-sm font-semibold text-blue-200 transition hover:text-white"
            >
              View store
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {storeDrops.map((drop) => (
              <Link
                key={drop.id}
                href="/store"
                className="overflow-hidden rounded-[8px] border border-white/10 bg-black/45 shadow-[0_18px_38px_rgba(0,0,0,0.22)] transition hover:border-blue-400/35"
              >
                <div className="relative aspect-[16/10] border-b border-white/10">
                  <Image
                    src={drop.imageUrl}
                    alt={drop.title}
                    fill
                    className="object-cover"
                  />
                  <div className="media-card-overlay absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.58),transparent_60%)]" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      {drop.status}
                    </span>
                    <span className="text-sm font-semibold text-blue-100">
                      {drop.price}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">
                    {drop.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {drop.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

async function getHubPosts() {
  try {
    return await getLatestPosts(3);
  } catch {
    return [];
  }
}

function HubStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold capitalize text-white">{value}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
