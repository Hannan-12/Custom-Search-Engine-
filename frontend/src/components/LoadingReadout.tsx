"use client";

import { useEffect, useRef, useState } from "react";

// An intentional loading sequence, not a spinner: the readout steps through the
// real stages of the pipeline. Respects prefers-reduced-motion by showing a
// single static line instead of an animated progression.
const STAGES = [
  "searching the web",
  "reading sources",
  "writing answer",
];

export default function LoadingReadout({ query }: { query: string }) {
  const [stage, setStage] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) return;

    const timers = [
      setTimeout(() => setStage(1), 1100),
      setTimeout(() => setStage(2), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="flex flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-label={`Working on: ${query}`}
    >
      {STAGES.map((label, i) => {
        const state =
          reduced.current || i === stage
            ? "active"
            : i < stage
              ? "done"
              : "pending";
        return (
          <div
            key={label}
            className="flex items-center gap-3 font-mono text-sm"
            style={{
              color:
                state === "pending" ? "var(--muted)" : "var(--ink)",
              opacity: state === "pending" ? 0.4 : 1,
            }}
          >
            <span
              aria-hidden
              style={{ color: state === "done" ? "var(--cite)" : undefined }}
            >
              {state === "done" ? "●" : state === "active" ? "◍" : "◦"}
            </span>
            <span>
              {label}
              {state === "active" && !reduced.current ? "…" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
