"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Uploading signal...");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("Network Accessed");
      setReady(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="forest-screen min-h-screen flex items-center justify-center px-6 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_58%)]" />

      <div className="w-full max-w-4xl text-center">
        <img
          src="/Logo.png"
          alt="Musemallow Logo"
          className="logo-image mx-auto w-[240px] sm:w-[320px] md:w-[460px] lg:w-[560px] h-auto select-none"
          draggable="false"
        />

        <h1 className="glitch-text mt-6 text-[13px] sm:text-base md:text-xl uppercase tracking-[0.45em] text-blue-200">
          Welcome to The Forest
        </h1>

        <p className="status-pulse mt-4 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.28em] text-blue-300/80">
          {status}
        </p>

        <button
          disabled={!ready}
          className={`mt-8 rounded-full px-8 py-3 text-sm md:text-base font-semibold transition-all duration-300 ${
            ready
              ? "border border-blue-400/70 bg-blue-500/10 text-blue-100 shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:bg-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.65)]"
              : "border border-blue-400/20 bg-blue-500/5 text-blue-200/40 cursor-not-allowed"
          }`}
        >
          Enter the Forest
        </button>
      </div>
    </main>
  );
}