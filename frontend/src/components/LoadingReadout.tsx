"use client";

import { useEffect, useRef, useState } from "react";

// The case log: the pipeline's real steps, written out in real time like a
// clerk building the file — not a generic spinner. Respects reduced-motion by
// showing all lines at once with no cursor.
const STEPS = [
  "Searching sources",
  "Reviewing exhibits",
  "Preparing verdict",
];

export default function LoadingReadout({ query }: { query: string }) {
  const [step, setStep] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setStep(STEPS.length - 1);
      return;
    }
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 2700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="font-mono text-sm text-shell-ink"
      role="status"
      aria-live="polite"
      aria-label={`Opening case: ${query}`}
    >
      {STEPS.map((label, i) => {
        const visible = reduced.current || i <= step;
        const active = !reduced.current && i === step;
        if (!visible) return null;
        return (
          <div
            key={label}
            className="flex items-center gap-2 py-0.5"
            style={{ color: i < step ? "var(--shell-muted)" : undefined }}
          >
            <span aria-hidden className="text-shell-muted">
              &gt;
            </span>
            <span>
              {label}
              {i < step ? " — done" : "…"}
            </span>
            {active && <span className="cursor">▋</span>}
          </div>
        );
      })}
    </div>
  );
}
