"use client";

import type { Source } from "@/lib/types";

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

// The evidence rail. Each card carries a colored index tab matching its
// citation number, and lights up when its [n] in the answer is active.
// "Show work" reveals the raw retrieved snippet that fed the answer — the
// retrieval step behind the polished output.
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
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Sources
        </h2>
        {hasSnippets && (
          <button
            type="button"
            onClick={onToggleWork}
            aria-pressed={showWork}
            className="font-mono text-xs text-muted hover:text-cite"
          >
            {showWork ? "hide work" : "show work"}
          </button>
        )}
      </div>
      <ol className="flex flex-col gap-3">
        {sources.map((source, i) => {
          const n = i + 1;
          const isActive = activeCite === n;
          return (
            <li key={n} id={`source-${n}`}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-card flex gap-3 rounded-lg border border-line bg-surface p-3 hover:bg-surface-2"
                data-active={isActive || undefined}
                data-pulse={pulseCite === n || undefined}
                onMouseEnter={() => onHover(n)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(n)}
                onBlur={() => onHover(null)}
              >
                <span className="source-tab mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border font-mono text-sm">
                  {n}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-body text-[0.98rem] leading-snug text-ink">
                    {source.title}
                  </span>
                  <span className="mt-1 truncate font-mono text-xs text-muted">
                    {hostname(source.url)}
                  </span>
                  {showWork && source.snippet && (
                    <span className="mt-2 border-l-2 border-line pl-2 font-body text-[0.85rem] leading-relaxed text-muted">
                      {source.snippet}
                    </span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      {showWork && (
        <p className="font-mono text-[0.7rem] leading-relaxed text-muted">
          Raw snippets retrieved from the web and passed to the model. The
          answer above is synthesized from these — this is the retrieval step.
        </p>
      )}
    </div>
  );
}
