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
    <main className="forest-screen min-h-screen flex items-center justify-center px-6 text-white relative overflow-hidden">
      <div className="forest-beam" />

      <div className="relative z-10 w-full max-w-6xl text-center">
        <img
          src="/Logo.png"
          alt="Musemallow Logo"
          className="logo-image mx-auto w-[300px] sm:w-[420px] md:w-[700px] lg:w-[980px] xl:w-[1180px] 2xl:w-[1320px] h-auto select-none"
          draggable="false"
        />

        <div className="mt-6 flex justify-center">
          <h1
            className="glitch-text text-center whitespace-nowrap text-[14px] sm:text-[18px] md:text-[28px] lg:text-[64px] xl:text-[72px] 2xl:text-[80px] uppercase tracking-[0.32em] text-blue-200"
            data-text={titleForLayers}
          >
            {typedTitle}
            <span className="typing-cursor" aria-hidden="true">
              |
            </span>
          </h1>
        </div>

        <p className="status-pulse mt-4 text-center text-[10px] sm:text-[12px] md:text-[16px] lg:text-[32px] xl:text-[36px] 2xl:text-[40px] uppercase tracking-[0.28em] text-blue-300/80">
          {status}
        </p>

        <button
          disabled={!ready}
          className={`mt-10 mx-auto block w-[55%] max-w-[800px] min-w-[260px] h-[64px] md:h-[80px] lg:h-[110px] rounded-full text-base md:text-xl lg:text-3xl font-semibold transition-all duration-300 ${
            ready
              ? "border border-blue-400/70 bg-blue-500/10 text-blue-100 shadow-[0_0_25px_rgba(37,99,235,0.55)] hover:bg-blue-500/20 hover:shadow-[0_0_40px_rgba(59,130,246,0.75)]"
              : "border border-blue-400/20 bg-blue-500/5 text-blue-200/40 cursor-not-allowed"
          }`}
        >
          Enter the Forest
        </button>
      </div>
    </main>
  );
}