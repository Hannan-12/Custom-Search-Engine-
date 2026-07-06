"use client";

import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
  busy: boolean;
  initial?: string;
};

// The hero input, pinned to the top. The question is the interface: keyboard-
// submittable, no mouse required.
export default function SearchBar({ onSearch, busy, initial = "" }: Props) {
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q && !busy) onSearch(q);
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <label
        htmlFor="q"
        className="font-mono text-sm text-cite shrink-0"
        aria-hidden
      >
        ask&nbsp;▸
      </label>
      <input
        id="q"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask anything — you'll get a cited answer"
        autoComplete="off"
        autoFocus
        className="w-full bg-transparent font-display text-2xl md:text-3xl text-ink placeholder:text-muted placeholder:font-body placeholder:text-xl focus:outline-none"
      />
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="shrink-0 rounded-md border border-line px-3 py-1.5 font-mono text-sm text-muted enabled:hover:border-cite enabled:hover:text-cite disabled:opacity-40"
        aria-label="Search"
      >
        {busy ? "…" : "⏎"}
      </button>
    </form>
  );
}
