"use client";

import type { Source } from "@/lib/types";
import { exhibitLabel } from "@/lib/exhibit";

type Props = {
  sources: Source[];
  activeCite: number | null;
  pulseCite: number | null;
  onHover: (n: number | null) => void;
  showWork: boolean;
  onToggleWork: () => void;
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// The exhibits: sources rendered as parchment case-file cards labeled EXHIBIT
// A/B/C. Each lights up when its citation is active. "Show work" reveals the
// raw retrieved snippet — the exhibit's underlying material.
export default function SourceList({
  sources,
  activeCite,
  pulseCite,
  onHover,
  showWork,
  onToggleWork,
}: Props) {
  const hasSnippets = sources.some((s) => s.snippet && s.snippet.length > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-shell-muted">
          Exhibits
        </h2>
        {hasSnippets && (
          <button
            type="button"
            onClick={onToggleWork}
            aria-pressed={showWork}
            className="font-mono text-xs text-shell-muted hover:text-shell-ink"
          >
            {showWork ? "hide material" : "show material"}
          </button>
        )}
      </div>
      <ol className="flex flex-col gap-3">
        {sources.map((source, i) => {
          const n = i + 1;
          const isActive = activeCite === n;
          return (
            <li key={n} id={`exhibit-${n}`}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="exhibit-card block rounded-md bg-parchment p-3"
                data-active={isActive || undefined}
                onMouseEnter={() => onHover(n)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(n)}
                onBlur={() => onHover(null)}
                style={
                  pulseCite === n
                    ? { boxShadow: "0 0 0 2px var(--ink) inset" }
                    : undefined
                }
              >
                <div className="mb-1.5 flex items-center justify-between border-b border-line-parchment pb-1.5">
                  <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink">
                    Exhibit {exhibitLabel(n)}
                  </span>
                  <span className="font-mono text-[0.7rem] text-ink-soft">
                    {hostname(source.url)}
                  </span>
                </div>
                <p className="font-body text-[0.98rem] leading-snug text-ink">
                  {source.title}
                </p>
                {showWork && source.snippet && (
                  <p className="mt-2 border-l-2 border-line-parchment pl-2 font-body text-[0.85rem] leading-relaxed text-ink-soft">
                    {source.snippet}
                  </p>
                )}
              </a>
            </li>
          );
        })}
      </ol>
      {showWork && (
        <p className="font-mono text-[0.7rem] leading-relaxed text-shell-muted">
          Raw material retrieved from each exhibit and entered into evidence. The
          answer is synthesized from these — this is the retrieval step.
        </p>
      )}
    </div>
  );
}
