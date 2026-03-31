"use client";

import { useEffect, useState } from "react";
import "./entrance.css";

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
    <main className="forest-screen min-h-screen flex items-center justify-center px-6 text-white relative overflow-hidden">
      <div className="forest-beam" />

      <div className="relative z-10 w-full max-w-5xl text-center">
        <img
          src="/logo.png"
          alt="Musemallow Logo"
          className="logo-image mx-auto w-[300px] sm:w-[420px] md:w-[560px] lg:w-[700px] xl:w-[780px] h-auto select-none"
          draggable="false"
        />

        <h1 className="glitch-text mt-6 text-[14px] sm:text-[18px] md:text-[24px] lg:text-[30px] uppercase tracking-[0.45em] text-blue-200">
          Welcome to The Forest
        </h1>

        <p className="status-pulse mt-4 text-[10px] sm:text-[12px] md:text-[15px] uppercase tracking-[0.28em] text-blue-300/80">
          {status}
        </p>

        <button
          disabled={!ready}
          className={`mt-8 rounded-full px-8 py-3 md:px-10 md:py-4 text-sm md:text-base font-semibold transition-all duration-300 ${
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