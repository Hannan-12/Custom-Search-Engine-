"use client";

// Empty and error states, in the case-file's voice: say what happened and what
// to do next. Kept quiet — no playful motion. These are serious moments.

export function EmptyState({ query }: { query: string }) {
  return (
    <div className="max-w-prose rounded-md bg-parchment p-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">
        Case closed — no exhibits
      </p>
      <p className="mt-3 font-body text-[1.25rem] leading-relaxed text-ink">
        Nothing came back for{" "}
        <span className="italic">&ldquo;{query}&rdquo;</span>. Try rephrasing it,
        or ask something more specific — a name, a date, or a place usually helps
        the search find solid exhibits.
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-prose rounded-md border border-line p-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-unverified">
        Case interrupted
      </p>
      <p className="mt-3 font-body text-[1.25rem] leading-relaxed text-shell-ink">
        The verdict couldn&rsquo;t be assembled. {message} Try again in a moment,
        and if it keeps happening, check that the answer service is running.
      </p>
    </div>
  );
}
