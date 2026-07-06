# Answer Engine

A Perplexity-style search engine. You ask a question; it pulls live results from
the web, then uses an LLM to synthesize a direct, **cited** answer — where every
claim traces back to a source — instead of handing you ten blue links.

It ships as three things:

1. A **CLI** (`search.py`) — the fastest way to demo the pipeline.
2. A **FastAPI** backend (`api/main.py`) — the same logic behind a `/search` endpoint.
3. A **Next.js frontend** (`frontend/`) — a designed answer-engine interface.

---

## What it looks like

**Citation linking** — hovering a `[n]` in the answer lights up its source card, so
you can trace any claim to its evidence:

![Citation linking](docs/screenshots/citation-linking.png)

**Source-agreement scoring** — when sources conflict, the engine says so instead of
blending contradictory figures into confident-sounding prose:

| Sources agree | Sources differ |
|---|---|
| ![Agree](docs/screenshots/agreement-agree.png) | ![Mixed](docs/screenshots/agreement-mixed.png) |

**Show your work** — reveal the raw retrieved snippets that fed the answer, i.e. the
retrieval step behind the polished output:

![Show your work](docs/screenshots/show-your-work.png)

---

## Architecture

```
                       ┌─────────────────────────────────────────────┐
   user query          │                  engine/                     │
       │               │                                              │
       ▼               │   retriever.py ──► synthesizer.py            │
 ┌───────────┐         │   (Tavily web      (Groq LLM, cite-only      │
 │  CLI       │───────►│    search +         prompt + agreement       │
 │  search.py │        │    authority        scoring)                 │
 └───────────┘         │    re-ranking)          │                    │
 ┌───────────┐         │        │                ▼                    │
 │ Next.js    │──HTTP─►│        └──► formatter.py (CLI output)         │
 │ frontend   │  POST  │                                              │
 └───────────┘/search  └─────────────────────────────────────────────┘
                                        │
                                        ▼
                       synthesized answer + numbered, cited sources
```

The core is the classic **RAG** pattern — retrieve, augment, generate — except
retrieval is a live web search rather than a vector database.

- **`engine/retriever.py`** — calls Tavily, cleans snippets (strips markdown-link
  clutter), and re-ranks results by domain authority so credible sources
  (encyclopedias, `.gov`/`.edu`, reference sites) float above forums and social media.
- **`engine/synthesizer.py`** — builds a numbered source block and asks Groq's Llama
  model to answer using *only* those sources, citing every claim. Also produces a
  structured source-agreement assessment.
- **`engine/formatter.py`** — pretty-prints the CLI output.
- **`api/main.py`** — wraps the pipeline in a `/search` endpoint with CORS and
  per-IP rate limiting.
- **`frontend/`** — the Next.js interface.

## Why Tavily + Groq

- **Tavily** for search: it's built specifically for LLM pipelines and returns clean,
  content-focused snippets out of the box, so there's no HTML scraping or boilerplate
  stripping to do before the LLM step. Generous free tier. (Serper and Brave are fine
  alternatives; the retriever is the only place that would change.)
- **Groq** for the LLM: free tier, and *fast* — inference latency is low enough that
  the synthesis step doesn't dominate the request. Runs `llama-3.3-70b-versatile`,
  which is more than capable of the "answer strictly from these sources" task.

Both are swappable: the retriever and synthesizer are isolated modules with a single
public function each.

---

## Setup

Requires **Python 3.11+** and **Node 18+**.

### 1. API keys

Both providers have free tiers. Sign up and grab a key:

- Tavily → <https://tavily.com>
- Groq → <https://console.groq.com>

```bash
cp .env.example .env
# then edit .env and fill in TAVILY_API_KEY and GROQ_API_KEY
```

### 2. Backend (CLI + API)

```bash
pip install -r requirements.txt
```

**CLI:**

```bash
python search.py "what is retrieval augmented generation"
python search.py "history of the internet" --num-results 3
python search.py "best python web framework" --raw   # skip the LLM, dump sources
```

**API:**

```bash
uvicorn api.main:app --reload
# POST http://localhost:8000/search  {"query": "..."}
# interactive docs at http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000  (expects the API on :8000)
```

The frontend reads the API URL from `NEXT_PUBLIC_API_URL` (defaults to
`http://localhost:8000`).

---

## Known limitations

Documented on purpose — this is what separates a demo from an engineering project.

- **Answer quality is bounded by search quality.** If Tavily returns weak or
  off-topic sources, the answer will be weak. Garbage in, garbage out — the
  cite-only prompt keeps the model honest about it, but it can't invent good sources.
- **Authority re-ranking is a heuristic, not a truth oracle.** It uses a curated
  domain list plus `.gov`/`.edu` rules. Country-specific government domains like
  `.gov.pk` aren't caught by the bare-`.gov` rule, and a low-authority page can still
  be correct. It's a nudge toward credible sources, not a guarantee.
- **Agreement scoring is LLM-judged**, so it's an assessment of what the *snippets*
  say, not ground truth. It's good at flagging obvious numeric conflicts (e.g.
  population figures) and shouldn't be read as a fact-check.
- **No streaming yet.** The full answer arrives at once after retrieval + generation
  (a few seconds); the UI shows a staged loading readout in the meantime.
- **Rate limiting is in-memory** (10 requests/min/IP). Fine for a single instance;
  a multi-instance deploy would need a shared store (e.g. Redis).
- **Session-only history.** Recent queries live in browser state and are gone on refresh.

---

## Project layout

```
.
├── search.py              # CLI entrypoint
├── engine/
│   ├── retriever.py       # Tavily search + snippet cleanup + authority ranking
│   ├── synthesizer.py     # Groq LLM: cited answer + agreement scoring
│   ├── formatter.py       # CLI output formatting
│   └── errors.py          # shared exception types → clean messages
├── api/
│   └── main.py            # FastAPI /search endpoint (CORS + rate limiting)
├── frontend/              # Next.js app (App Router, TypeScript, Tailwind)
├── requirements.txt
├── .env.example
└── docs/screenshots/
```
