"use client";

import { parseAnswer } from "@/lib/parseAnswer";

type Props = {
  answer: string;
  activeCite: number | null;
  onCiteHover: (n: number | null) => void;
  onCiteClick: (n: number) => void;
};

// Renders the synthesized answer as reading prose, with each [n] citation as an
// interactive marker bound to its source card (the signature interaction).
export default function Answer({
  answer,
  activeCite,
  onCiteHover,
  onCiteClick,
}: Props) {
  const tokens = parseAnswer(answer);

  return (
    <p className="font-body text-[1.3rem] leading-[1.6] text-ink">
      {tokens.map((token, i) => {
        if (token.kind === "text") {
          return <span key={i}>{token.value}</span>;
        }
        const isActive = activeCite === token.n;
        return (
          <a
            key={i}
            href={`#source-${token.n}`}
            className="cite-ref align-super"
            data-active={isActive || undefined}
            aria-label={`Jump to source ${token.n}`}
            onMouseEnter={() => onCiteHover(token.n)}
            onMouseLeave={() => onCiteHover(null)}
            onFocus={() => onCiteHover(token.n)}
            onBlur={() => onCiteHover(null)}
            onClick={(e) => {
              e.preventDefault();
              onCiteClick(token.n);
            }}
          >
            [{token.n}]
          </a>
        );
      })}
    </p>
  );
}
