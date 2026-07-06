"use client";

import { sanitizeQuery } from "@/lib/sanitizeQuery";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  busy: boolean;
};

// The hero input, pinned to the top. The question is the interface: keyboard-
// submittable, no mouse required. Value is controlled by the parent so history
// clicks can update what's shown here.
export default function SearchBar({ value, onChange, onSearch, busy }: Props) {
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = sanitizeQuery(value);
    if (q && !busy) onSearch(q);
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <label
        htmlFor="q"
        className="font-mono text-sm text-shell-muted shrink-0"
        aria-hidden
      >
        open&nbsp;▸
      </label>
      <input
        id="q"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="State the question to investigate"
        autoComplete="off"
        autoFocus
        className="w-full bg-transparent font-display text-2xl md:text-3xl text-shell-ink placeholder:text-shell-muted placeholder:font-body placeholder:text-xl focus:outline-none"
      />
      <button
        type="submit"
        disabled={busy || !sanitizeQuery(value)}
        className="shrink-0 rounded-md border border-line px-3 py-1.5 font-mono text-sm text-shell-muted enabled:hover:border-shell-ink enabled:hover:text-shell-ink disabled:opacity-40"
        aria-label="Open case"
      >
        {busy ? "…" : "⏎"}
      </button>
    </form>
  );
}
