"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type MuseTheme = "nox" | "sol";

type ThemeContextValue = {
  theme: MuseTheme;
  setTheme: (theme: MuseTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<MuseTheme>(() => {
    if (typeof window === "undefined") return "nox";

    const savedTheme = window.localStorage.getItem("musehub-theme");
    return savedTheme === "sol" || savedTheme === "nox" ? savedTheme : "nox";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function setTheme(nextTheme: MuseTheme) {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("musehub-theme", nextTheme);
  }

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "nox" ? "sol" : "nox"),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useMuseTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useMuseTheme must be used inside ThemeProvider.");
  }

  return context;
}
