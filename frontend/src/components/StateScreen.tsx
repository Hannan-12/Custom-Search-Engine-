"use client";

// Empty and error states, written in the interface's voice: say what happened
// and what to do next — never a raw message or an apology.

export function EmptyState({ query }: { query: string }) {
  return (
    <div className="max-w-prose">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        No sources
      </p>
      <p className="mt-3 font-body text-[1.35rem] leading-relaxed text-ink">
        Nothing came back for{" "}
        <span className="italic">&ldquo;{query}&rdquo;</span>. Try rephrasing it,
        or ask something more specific — a name, a date, or a place usually helps
        the search find solid sources.
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-prose">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-danger">
        Search interrupted
      </p>
      <p className="mt-3 font-body text-[1.35rem] leading-relaxed text-ink">
        The answer couldn&rsquo;t be assembled. {message} Ask again in a moment,
        and if it keeps happening, check that the answer service is running.
      </p>
    </div>
  );
}
