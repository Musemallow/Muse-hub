"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Uploading signal...");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("Network Accessed");
      setReady(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)]" />

      <div className="text-center space-y-6 px-6">

        {/* LOGO */}
        <img
          src="/Logo.png"
          alt="Musemallow Logo"
          className="mx-auto w-[260px] drop-shadow-[0_0_20px_#3b82f6]"
        />

        {/* GLITCH TITLE */}
        <h1 className="text-2xl tracking-[0.4em] uppercase text-blue-300 glitch">
          Welcome to The Forest
        </h1>

        {/* STATUS TEXT */}
        <p className="text-sm text-blue-200/70 tracking-widest">
          {status}
        </p>

        {/* BUTTON */}
        <button
          disabled={!ready}
          className={`mt-4 w-full max-w-xs mx-auto rounded-xl border border-blue-500/80 py-3 text-blue-200 transition
          ${
            ready
              ? "bg-blue-500/10 hover:bg-blue-500/20 shadow-[0_0_25px_#3b82f6]"
              : "opacity-40 cursor-not-allowed"
          }`}
        >
          Enter the Forest
        </button>
      </div>
    </main>
  );
}