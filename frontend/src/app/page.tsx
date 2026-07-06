"use client";

import { useCallback, useState } from "react";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import Answer from "@/components/Answer";
import SourceList from "@/components/SourceList";
import LoadingReadout from "@/components/LoadingReadout";
import { EmptyState, ErrorState } from "@/components/StateScreen";
import { search, ApiError } from "@/lib/api";
import type { SearchState } from "@/lib/types";

export default function Home() {
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [history, setHistory] = useState<string[]>([]);
  // Shared citation focus — the signature interaction lives here.
  const [activeCite, setActiveCite] = useState<number | null>(null);
  const [pulseCite, setPulseCite] = useState<number | null>(null);

  const runSearch = useCallback(async (query: string) => {
    setActiveCite(null);
    setState({ status: "loading", query });
    setHistory((h) => [query, ...h.filter((q) => q !== query)].slice(0, 8));
    try {
      const result = await search(query);
      setState({ status: "done", query, result });
    } catch (err) {
      if (err instanceof ApiError && err.message === "__EMPTY__") {
        setState({ status: "empty", query });
      } else {
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong on the way to an answer.";
        setState({ status: "error", query, message });
      }
    }
  }, []);

  // Clicking a citation scrolls to its source card and pulses it.
  const onCiteClick = useCallback((n: number) => {
    setActiveCite(n);
    const el = document.getElementById(`source-${n}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setPulseCite(n);
      window.setTimeout(() => setPulseCite(null), 750);
    }
  }, []);

  const busy = state.status === "loading";
  const showResults = state.status === "done";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 sm:px-8">
      {/* Pinned hero input */}
      <header className="sticky top-0 z-10 -mx-5 border-b border-line bg-field/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
            answer engine
          </span>
          <ThemeToggle />
        </div>
        <SearchBar
          onSearch={runSearch}
          busy={busy}
          initial={state.status !== "idle" ? state.query : ""}
        />
      </header>

      {/* Body */}
      <section className="flex-1 py-10">
        {state.status === "idle" && (
          <div className="max-w-prose pt-8">
            <p className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              Ask a question. Get an answer where every claim traces back to a
              live source.
            </p>
            <p className="mt-4 font-body text-lg text-muted">
              Not a list of links to sift through — a written answer, with the
              evidence attached. Hover a{" "}
              <span className="cite-ref" data-active>
                [1]
              </span>{" "}
              to see where it came from.
            </p>
          </div>
        )}

        {state.status === "loading" && (
          <div className="pt-8">
            <LoadingReadout query={state.query} />
          </div>
        )}

        {state.status === "empty" && (
          <div className="pt-6">
            <EmptyState query={state.query} />
          </div>
        )}
        {state.status === "error" && (
          <div className="pt-6">
            <ErrorState message={state.message} />
          </div>
        )}

        {showResults && (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_20rem]">
            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Answer
              </h2>
              <Answer
                answer={state.result.answer}
                activeCite={activeCite}
                onCiteHover={setActiveCite}
                onCiteClick={onCiteClick}
              />
            </div>
            <aside className="md:sticky md:top-32 md:self-start">
              <SourceList
                sources={state.result.sources}
                activeCite={activeCite}
                pulseCite={pulseCite}
                onHover={setActiveCite}
              />
            </aside>
          </div>
        )}
      </section>

      {/* Session history */}
      {history.length > 1 && (
        <footer className="border-t border-line py-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              recent
            </span>
            {history.slice(1).map((q) => (
              <button
                key={q}
                onClick={() => runSearch(q)}
                disabled={busy}
                className="font-body text-sm text-muted hover:text-cite disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </footer>
      )}
    </main>
  );
}
