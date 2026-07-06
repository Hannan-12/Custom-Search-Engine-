"use client";

import { useEffect, useState } from "react";

// Lets the viewer override the OS theme; stamps data-theme on <html> so the
// CSS overrides in globals.css win in both directions.
type Mode = "system" | "light" | "dark";

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
  }, [mode]);

  const next: Record<Mode, Mode> = {
    system: "light",
    light: "dark",
    dark: "system",
  };
  const label: Record<Mode, string> = {
    system: "auto",
    light: "light",
    dark: "dark",
  };

  return (
    <button
      type="button"
      onClick={() => setMode(next[mode])}
      className="rounded border border-line px-2.5 py-1 font-mono text-xs text-muted hover:text-ink hover:border-cite"
      aria-label={`Theme: ${label[mode]}. Click to change.`}
    >
      {label[mode]}
    </button>
  );
}
