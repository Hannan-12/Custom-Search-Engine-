// Clean up a query before it goes to the backend. Pasted text often carries
// wrapping or smart quotes (e.g. copying `"what is X"` from an example), which
// pollute the web search. We strip surrounding quotes and normalize smart
// quotes to plain ones, while leaving quotes that are genuinely mid-phrase.
export function sanitizeQuery(raw: string): string {
  let q = raw.trim();

  // Normalize smart quotes to straight quotes.
  q = q.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  // Strip a single layer of matching wrapping quotes: "query" or 'query'.
  const wrapped = /^(["'])(.*)\1$/.exec(q);
  if (wrapped) {
    q = wrapped[2].trim();
  }

  // Strip a stray leading or trailing quote left over from a bad paste.
  q = q.replace(/^["']+/, "").replace(/["']+$/, "").trim();

  return q;
}
