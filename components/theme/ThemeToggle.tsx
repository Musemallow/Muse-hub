"use client";

import { useMuseTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useMuseTheme();

  return (
    <div className="theme-toggle" aria-label="Theme mode">
      <button
        type="button"
        className={theme === "nox" ? "is-active" : ""}
        onClick={() => setTheme("nox")}
        aria-pressed={theme === "nox"}
      >
        Nox
      </button>
      <button
        type="button"
        className={theme === "sol" ? "is-active" : ""}
        onClick={() => setTheme("sol")}
        aria-pressed={theme === "sol"}
      >
        Sol
      </button>
    </div>
  );
}
