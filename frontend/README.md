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

Direction: **"Ledger / Instrument."** This is an *instant-answer engine*, not a
chatbot — so the UI reads like an instrument that resolves a question, not a chat
thread. A calm slate-teal field keeps the answer and the citation accent as the only
things that pop; the teal accent has exactly one job — marking the link between a
claim and its evidence.

- **Type:** Fraunces (display / question), Newsreader (answer prose), IBM Plex Mono
  (citations, URLs, the loading readout).
- **Signature interaction:** hovering a `[n]` in the answer highlights its source
  card, and vice versa; clicking scrolls to and pulses the card.
- **States:** landing, results, staged loading readout, empty, error, session history.
- **Differentiators:** source-agreement badge, and a "show your work" toggle that
  reveals the raw retrieved snippets.

## Structure

```
src/
├── app/
│   ├── page.tsx           # orchestrates state + the citation-link interaction
│   ├── layout.tsx         # fonts + metadata
│   └── globals.css        # design tokens (light/dark), citation styles
├── components/
│   ├── SearchBar.tsx      # pinned hero input
│   ├── Answer.tsx         # answer prose with interactive [n] citations
│   ├── SourceList.tsx     # evidence rail + "show your work"
│   ├── AgreementBadge.tsx # source-agreement readout
│   ├── LoadingReadout.tsx # staged loading sequence
│   ├── StateScreen.tsx    # empty + error states
│   └── ThemeToggle.tsx    # auto / light / dark
└── lib/
    ├── api.ts             # calls the /search endpoint
    ├── parseAnswer.ts     # splits answer prose into text + citation tokens
    ├── sanitizeQuery.ts   # strips stray/wrapping/smart quotes
    └── types.ts
```
