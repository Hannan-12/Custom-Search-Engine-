"use client";

import { useMemo } from "react";
import type { Agreement } from "@/lib/types";

type Props = {
  agreement: Agreement;
  note: string;
  /** Bump this (e.g. a query id) to re-trigger the press animation. */
  animateKey: string;
};

// The verdict stamp — the signature element. The agreement-scoring feature,
// given a physical identity: an inked rubber stamp pressed onto the answer.
const VERDICT: Record<
  Agreement,
  { label: string; cls: string }
> = {
  agree: { label: "Confirmed", cls: "stamp-confirmed" },
  mixed: { label: "Disputed", cls: "stamp-disputed" },
  none: { label: "Unverified", cls: "stamp-unverified" },
  single: { label: "Single source", cls: "stamp-single" },
};

export default function VerdictStamp({ agreement, note, animateKey }: Props) {
  const { label, cls } = VERDICT[agreement];

  // A small deterministic rotation per verdict so it reads hand-stamped, not
  // copy-pasted — stable across re-renders of the same answer.
  const rotation = useMemo(() => {
    let h = 0;
    for (const c of animateKey) h = (h * 31 + c.charCodeAt(0)) % 1000;
    return (h % 9) - 4; // -4°..+4°
  }, [animateKey]);

  return (
    <span
      className="relative inline-block"
      role="status"
      aria-label={`Verdict: ${label}. ${note}`}
    >
      <span
        key={animateKey}
        className={`stamp stamp-animate ${cls}`}
        style={{ ["--stamp-rot" as string]: `${rotation}deg` }}
      >
        <span className="text-[0.9rem]">{label}</span>
        {note && (
          <span className="mt-0.5 text-[0.55rem] font-normal tracking-[0.1em] opacity-80">
            {note}
          </span>
        )}
      </span>
      <span
        key={`${animateKey}-impact`}
        aria-hidden
        className="stamp-impact absolute inset-0 rounded"
      />
    </span>
  );
}
