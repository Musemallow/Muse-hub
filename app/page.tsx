"use client";

import { useEffect, useMemo, useState } from "react";
import "./entrance.css";

const fullTitle = "Welcome to The Forest";

export default function Home() {
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
    <main className="forest-screen min-h-screen flex items-center justify-center px-4 sm:px-6 text-white relative overflow-hidden">
      <div className="forest-beam" />

      <div className="relative z-10 w-full max-w-[760px] text-center mx-auto">
        <img
          src="/Logo.png"
          alt="Musemallow Logo"
          className="logo-image mx-auto w-[220px] sm:w-[280px] md:w-[360px] lg:w-[420px] h-auto select-none"
          draggable="false"
        />

        <div className="mt-4 flex justify-center">
          <h1
            className="glitch-text text-center whitespace-nowrap text-[12px] sm:text-[14px] md:text-[18px] lg:text-[22px] uppercase tracking-[0.22em] text-blue-200"
            data-text={titleForLayers}
          >
            {typedTitle}
            <span className="typing-cursor" aria-hidden="true">
              |
            </span>
          </h1>
        </div>

        <p className="status-pulse mt-3 text-center text-[10px] sm:text-[11px] md:text-[13px] lg:text-[15px] uppercase tracking-[0.18em] text-blue-300/80">
          {status}
        </p>

        <button
          disabled={!ready}
          className={`mt-6 mx-auto block w-full max-w-[260px] h-[42px] rounded-full text-[13px] md:text-[14px] font-semibold transition-all duration-300 ${
            ready
              ? "border border-blue-400/70 bg-blue-500/10 text-blue-100 shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:bg-blue-500/20 hover:shadow-[0_0_28px_rgba(59,130,246,0.65)]"
              : "border border-blue-400/20 bg-blue-500/5 text-blue-200/40 cursor-not-allowed"
          }`}
        >
          Enter the Forest
        </button>
      </div>
    </main>
  );
}