"use client";

import { useEffect, useState } from "react";
import "./entrance.css";

export default function Home() {
  const fullText = "WELCOME TO THE FOREST";

  const [typedText, setTypedText] = useState("");
  const [status, setStatus] = useState("Uploading Signal");
  const [ready, setReady] = useState(false);

  // typing effect
  useEffect(() => {
    let index = 0;

    const typing = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;

      if (index === fullText.length) {
        clearInterval(typing);
      }
    }, 40);

    return () => clearInterval(typing);
  }, []);

  // status change
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("Network Accessed");
      setReady(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="forest-screen min-h-screen flex items-center justify-center px-4 text-white">
      
      <div className="forest-beam" />


      <div className="relative z-10 w-full text-center entrance-stack">


        <img
          src="/Logo.png"
          alt="Musemallow Logo"
          className="logo-image mx-auto w-[240px] sm:w-[320px] md:w-[460px] lg:w-[560px] h-auto select-none"
          draggable="false"
        />


        <h1 className="forest-title mt-4 text-[20px] sm:text-[24px] md:text-[34px] lg:text-[48px] xl:text-[58px] 2xl:text-[64px] text-blue-100">
          {typedText}
          <span className="typing-cursor">|</span>
        </h1>


        <p className="forest-status mt-3 text-[12px] sm:text-[14px] md:text-[18px] lg:text-[20px] uppercase text-blue-300/80">
          {status}
        </p>


        <button
          disabled={!ready}
          className={`mt-6 rounded-full px-10 py-3 md:px-14 md:py-4 lg:px-16 lg:py-5 text-sm md:text-base lg:text-lg font-semibold transition-all duration-300 ${
            ready
              ? "bg-blue-600 hover:bg-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.6)]"
              : "bg-blue-900/30 text-blue-400/40 cursor-not-allowed"
          }`}
        >
          Enter The Forest
        </button>

      </div>
    </main>
  );
}