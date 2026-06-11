"use client";

import { useEffect, useState } from "react";

const KEY = "petdate:theme";

type Theme = "light" | "dark" | "system";

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const effective =
    theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
  if (effective === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem(KEY) : null) as Theme | null;
    const initial: Theme = saved || "light";
    setTheme(initial);
    apply(initial);

    if (initial === "system" && typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  const set = (next: Theme) => {
    setTheme(next);
    if (typeof window !== "undefined") localStorage.setItem(KEY, next);
    apply(next);
  };

  return { theme, setTheme: set };
}
