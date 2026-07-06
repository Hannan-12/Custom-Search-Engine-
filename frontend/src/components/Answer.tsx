"use client";

import { parseAnswer } from "@/lib/parseAnswer";
import { exhibitLabel } from "@/lib/exhibit";

type Props = {
  answer: string;
  activeCite: number | null;
  onCiteHover: (n: number | null) => void;
  onCiteClick: (n: number) => void;
};

// The answer sheet's prose, with each citation as an interactive [A]/[B] marker
// bound to its exhibit card (the signature interaction). Citation numbers from
// the model are shown as exhibit letters to match the EXHIBIT A/B/C labels.
export default function Answer({
  answer,
  activeCite,
  onCiteHover,
  onCiteClick,
}: Props) {
  const tokens = parseAnswer(answer);

  return (
    <p className="font-body text-[1.25rem] leading-[1.7] text-ink">
      {tokens.map((token, i) => {
        if (token.kind === "text") {
          return <span key={i}>{token.value}</span>;
        }
        const isActive = activeCite === token.n;
        return (
          <a
            key={i}
            href={`#exhibit-${token.n}`}
            className="cite-ref align-super"
            data-active={isActive || undefined}
            aria-label={`Jump to exhibit ${exhibitLabel(token.n)}`}
            onMouseEnter={() => onCiteHover(token.n)}
            onMouseLeave={() => onCiteHover(null)}
            onFocus={() => onCiteHover(token.n)}
            onBlur={() => onCiteHover(null)}
            onClick={(e) => {
              e.preventDefault();
              onCiteClick(token.n);
            }}
          >
            [{exhibitLabel(token.n)}]
          </a>
        );
      })}
    </p>
  );
}
