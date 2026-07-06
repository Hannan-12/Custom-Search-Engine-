// Exhibits are labeled by letter (A, B, C…) to match the case-file metaphor.
// The nth source (1-indexed) becomes its letter; beyond 26 we fall back to
// the number so nothing breaks.
export function exhibitLabel(n: number): string {
  if (n >= 1 && n <= 26) {
    return String.fromCharCode(64 + n); // 1 -> A
  }
  return String(n);
}
