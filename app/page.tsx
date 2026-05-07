"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import "./entrance.css";

const fullTitle = "Welcome to The Forest";

export default function Home() {
  const router = useRouter();

  const [status, setStatus] = useState("Uploading signal...");
  const [ready, setReady] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");

  useEffect(() => {
    let index = 0;

    const typing = setInterval(() => {
      index += 1;
      setTypedTitle(fullTitle.slice(0, index));

      if (index >= fullTitle.length) {
        clearInterval(typing);
      }
    }, 70);

    return () => clearInterval(typing);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("Network Accessed");
      setReady(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const titleForLayers = useMemo(
    () => (typedTitle.length > 0 ? typedTitle : " "),
    [typedTitle]
  );

  return (
    <main className="forest-screen relative flex min-h-screen items-center justify-center overflow-hidden px-4 text-white sm:px-6">
      <div className="forest-beam" />

      <div className="relative z-10 mx-auto w-full max-w-[760px] text-center">
        <Image
          src="/Logo.png"
          alt="Musemallow Logo"
          width={4000}
          height={2500}
          priority
          className="logo-image mx-auto h-auto w-[220px] select-none sm:w-[280px] md:w-[360px] lg:w-[420px]"
          draggable="false"
        />

        <div className="mt-4 flex justify-center">
          <h1
            className="glitch-text whitespace-nowrap text-center text-[12px] uppercase tracking-[0.22em] text-blue-200 sm:text-[14px] md:text-[18px] lg:text-[22px]"
            data-text={titleForLayers}
          >
            {typedTitle}
            <span className="typing-cursor" aria-hidden="true">
              |
            </span>
          </h1>
        </div>

        <p className="status-pulse mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-blue-300/80 sm:text-[11px] md:text-[13px] lg:text-[15px]">
          {status}
        </p>

        <button
          disabled={!ready}
          onClick={() => {
            if (!ready) return;

            setStatus("Entering...");
            setTimeout(() => {
              router.push("/hub");
            }, 400);
          }}
          className={`mx-auto mt-6 block h-[42px] w-full max-w-[260px] rounded-full text-[13px] font-semibold transition-all duration-300 md:text-[14px] ${
            ready
              ? "border border-blue-400/70 bg-blue-500/10 text-blue-100 shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:bg-blue-500/20 hover:shadow-[0_0_28px_rgba(59,130,246,0.65)]"
              : "cursor-not-allowed border border-blue-400/20 bg-blue-500/5 text-blue-200/40"
          }`}
        >
          Enter the Forest
        </button>
      </div>
    </main>
  );
}
