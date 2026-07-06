"use client";

import type { Agreement } from "@/lib/types";

type Props = {
  agreement: Agreement;
  note: string;
};

// A compact readout of how well the retrieved sources agree with each other.
// This is the honest part of an answer engine: when sources conflict, say so
// instead of blending contradictory figures into confident-sounding prose.
const CONFIG: Record<
  Agreement,
  { label: string; glyph: string; color: string }
> = {
  agree: { label: "Sources agree", glyph: "●", color: "var(--cite)" },
  mixed: { label: "Sources differ", glyph: "◆", color: "var(--warn)" },
  single: { label: "Single source", glyph: "○", color: "var(--muted)" },
  none: { label: "No relevant sources", glyph: "⊘", color: "var(--danger)" },
};

export default function AgreementBadge({ agreement, note }: Props) {
  const { label, glyph, color } = CONFIG[agreement];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
      style={{ borderColor: color }}
    >
      <span aria-hidden style={{ color }} className="text-xs">
        {glyph}
      </span>
      <span className="font-mono text-xs" style={{ color }}>
        {label}
      </span>
      {note && (
        <span className="font-mono text-xs text-muted">— {note}</span>
      )}
    </div>
  );
}
