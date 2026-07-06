# Answer Engine — frontend

The Next.js interface for the answer engine. See the [root README](../README.md)
for the full project (architecture, backend, why Tavily + Groq).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Requires the FastAPI backend running (default `http://localhost:8000`). Point
elsewhere with `NEXT_PUBLIC_API_URL` in `.env.local`.

## Design

Direction: **"Case File."** The product verifies claims against evidence and never
hides disagreement — so the UI reads like a case report, not another AI-chat
template. A charcoal desk holds a parchment answer sheet; sources are numbered
**exhibits**; the agreement score is a **verdict stamp** pressed onto the answer.
Earth-tone accents are semantic — each maps to a verdict state, never decoration.
One committed dark look (no theme toggle).

- **Type:** Fraunces (case-file headlines), Newsreader (answer prose), IBM Plex Mono
  (case numbers, EXHIBIT labels, the verdict stamp, the case-log).
- **Signature element:** the verdict stamp — CONFIRMED (green) / DISPUTED (rust) /
  UNVERIFIED (red), rotated and ink-textured, animated in like it's physically
  pressed when the answer resolves.
- **Signature interaction:** hovering a `[A]` in the answer lifts and highlights its
  exhibit card, and vice versa; clicking scrolls to and pulses the card.
- **States:** landing, results, staged case-log loading, empty, error, prior cases.
- **Differentiators:** the verdict stamp (source-agreement scoring), and a "show
  material" toggle that reveals the raw retrieved snippet behind each exhibit.

## Structure

```
src/
├── app/
│   ├── page.tsx           # orchestrates state + the citation-link interaction
│   ├── layout.tsx         # fonts + metadata
│   └── globals.css        # design tokens (light/dark), citation styles
├── components/
│   ├── SearchBar.tsx      # the question input ("open a case")
│   ├── Answer.tsx         # answer prose with interactive [A] citations
│   ├── SourceList.tsx     # exhibit cards + "show material"
│   ├── VerdictStamp.tsx   # the verdict stamp (agreement scoring)
│   ├── LoadingReadout.tsx # staged case-log loading sequence
│   └── StateScreen.tsx    # empty + error states
└── lib/
    ├── api.ts             # calls the /search endpoint
    ├── parseAnswer.ts     # splits answer prose into text + citation tokens
    ├── exhibit.ts         # maps source number -> exhibit letter (A, B, C…)
    ├── sanitizeQuery.ts   # strips stray/wrapping/smart quotes
    └── types.ts
```
