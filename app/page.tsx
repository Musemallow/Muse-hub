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

<h1 className="forest-title mt-6 whitespace-nowrap text-[12px] sm:text-[16px] md:text-[24px] lg:text-[36px] xl:text-[42px] 2xl:text-[48px] uppercase tracking-[0.28em] text-blue-200">
  {typedTitle}
  <span className="typing-cursor" aria-hidden="true">
    |
  </span>
</h1>
        <p className="status-pulse mt-4 text-[10px] sm:text-[12px] md:text-[22px] lg:text-[28px] xl:text-[32px] 2xl:text-[36px] uppercase tracking-[0.28em] text-blue-300/80">
          {status}
        </p>

<button
  disabled={!ready}
  className={`mt-8 mx-auto w-[45%] max-w-[600px] min-w-[200px] h-[48px] md:h-[60px] lg:h-[72px] rounded-full text-sm md:text-base lg:text-lg font-semibold transition-all duration-300 ${
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