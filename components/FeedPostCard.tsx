"use client";

import Link from "next/link";
import { FeedPost } from "../types/content";

export default function FeedPostCard({
  post,
  compact = false,
}: {
  post: FeedPost;
  compact?: boolean;
}) {
  const images = post.media.filter((item) => item.kind === "image");
  const videos = post.media.filter((item) => item.kind === "video");
  const audios = post.media.filter((item) => item.kind === "audio");

  return (
    <article className="rounded-[8px] border border-blue-400/15 bg-[#050811]/90 p-5 shadow-[0_18px_38px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-blue-400/35 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
          {post.visibility}
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          {formatDate(post.publishedAt)}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-bold text-white">{post.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
        {compact ? trimContent(post.content) : post.content}
      </p>

      {images.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {images.slice(0, compact ? 2 : images.length).map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-[8px] border border-white/10 bg-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.name}
                className="aspect-[16/10] h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {!compact && videos.length > 0 && (
        <div className="mt-4 grid gap-3">
          {videos.map((video) => (
            <video
              key={video.id}
              src={video.url}
              controls
              className="w-full rounded-[8px] border border-white/10 bg-black"
            />
          ))}
        </div>
      )}

      {!compact && audios.length > 0 && (
        <div className="mt-4 grid gap-3">
          {audios.map((audio) => (
            <audio key={audio.id} src={audio.url} controls className="w-full" />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <span>
          Likes {post.likeCount} / Comments {post.commentCount}
        </span>
        <Link
          href={`/post/${post.id}`}
          className="font-semibold text-blue-100 transition hover:text-white"
        >
          Open Signal
        </Link>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function trimContent(value: string) {
  if (value.length <= 220) return value;
  return `${value.slice(0, 217)}...`;
}
