import type { AnswerToken } from "./types";

// The backend returns citations inline as [1], [2], or grouped like [1, 2, 4].
// We split the answer prose into text runs and citation markers so the UI can
// render each [n] as an interactive element that links to its source card.
const CITE_PATTERN = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

export function parseAnswer(answer: string): AnswerToken[] {
  const tokens: AnswerToken[] = [];
  let lastIndex = 0;

  for (const match of answer.matchAll(CITE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      tokens.push({ kind: "text", value: answer.slice(lastIndex, start) });
    }
    // A single bracket may hold several numbers: [1, 2, 4] -> three markers.
    for (const numStr of match[1].split(",")) {
      const n = parseInt(numStr.trim(), 10);
      if (!Number.isNaN(n)) {
        tokens.push({ kind: "cite", n });
      }
    }
    lastIndex = start + match[0].length;
  }

  if (lastIndex < answer.length) {
    tokens.push({ kind: "text", value: answer.slice(lastIndex) });
  }
  return tokens;
}
