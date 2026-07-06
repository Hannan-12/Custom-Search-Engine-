# Project: Custom Search Engine with LLM Capabilities

A Perplexity-style command-line (and optional API) search engine: takes a user query, pulls live results from a search API, then uses an LLM to synthesize a direct, cited answer instead of just a list of links.

Hand this file to Claude Code with: "Read this spec and build it step by step."

---

## 1. Goal

Build a tool where a user types a question and gets back:
- A synthesized natural-language answer (not just links)
- Inline citations pointing to the sources used
- The raw source list as backup

Two interfaces to build, in order:
1. **CLI tool** (`search.py`) — fastest to ship, easiest to demo
2. **FastAPI wrapper** (`api/main.py`) — turns the CLI logic into a `/search` endpoint, so it can later plug into a Next.js frontend

---

## 2. Tech Stack

- **Language:** Python 3.11+
- **Search API:** Serper.dev (Google results via API, generous free tier) — alternative: Brave Search API or Tavily (built specifically for LLM search use cases, worth trying first)
- **LLM:** Groq API (free tier, very fast) running Llama 3.1/3.3 — you already have Groq experience from DevSkill Tracker
- **HTTP:** `httpx`
- **CLI:** `argparse` or `typer` (prefer `typer` for cleaner UX)
- **Env management:** `python-dotenv`
- **Optional web layer:** FastAPI (reuse your existing FastAPI conventions from TNB/GoHighReview)

---

## 3. Architecture

```
User query
   │
   ▼
[1] Query Search API (Tavily/Serper) → top 5-8 results (title, url, snippet)
   │
   ▼
[2] Build context block from results
   │
   ▼
[3] Send context + query to LLM with a strict prompt:
       "Answer using ONLY the provided sources.
        Cite sources inline as [1], [2] etc.
        If sources don't answer it, say so."
   │
   ▼
[4] Print: synthesized answer + numbered source list with URLs
```

This is the same RAG pattern you used in your Legal AI Assistant project (retrieve → augment → generate) — just retrieval is a live web search instead of a vector DB.

---

## 4. Step-by-Step Build Plan (give this to Claude Code as the task order)

### Step 1 — Project scaffold
```
custom-search-engine/
├── .env.example
├── requirements.txt
├── search.py          # CLI entrypoint
├── engine/
│   ├── __init__.py
│   ├── retriever.py   # calls the search API
│   ├── synthesizer.py # calls the LLM
│   └── formatter.py   # pretty-prints CLI output
├── api/
│   └── main.py        # FastAPI wrapper (Step 5)
└── README.md
```

### Step 2 — Retriever (`engine/retriever.py`)
- Function `search_web(query: str, num_results: int = 6) -> list[dict]`
- Each result dict: `{title, url, snippet}`
- Use Tavily API first choice (`https://api.tavily.com/search`) — it's built for LLM pipelines and returns clean snippets already
- Handle: empty results, API errors, timeout (5s)

### Step 3 — Synthesizer (`engine/synthesizer.py`)
- Function `synthesize(query: str, results: list[dict]) -> str`
- Build numbered source context, e.g.:
  ```
  [1] Title — snippet (url)
  [2] Title — snippet (url)
  ```
- System prompt (use almost verbatim):
  > "You are a search assistant. Answer the user's question using ONLY the numbered sources below. Cite every claim with its source number in brackets, e.g. [1]. If the sources don't contain enough information, say so explicitly. Be concise — 3-5 sentences unless the question needs more."
- Call Groq's `llama-3.3-70b-versatile` (or whatever current fast model is available)
- Return plain text answer

### Step 4 — CLI (`search.py`)
- Use `typer` for a single command: `python search.py "your query here"`
- Flow: retrieve → synthesize → format → print
- Print format:
  ```
  Answer:
  <synthesized answer with [1][2] citations>

  Sources:
  [1] Title — url
  [2] Title — url
  ```
- Add `--num-results` flag (default 6)
- Add `--raw` flag to skip LLM and just dump search results

### Step 5 — FastAPI wrapper (`api/main.py`)
- Single POST endpoint `/search` accepting `{"query": "..."}`
- Returns `{"answer": "...", "sources": [{"title","url"}]}`
- CORS enabled for `localhost:3000` (so the Next.js frontend in Section 6 can call it)
- This turns the CLI logic into something a real frontend can consume — required before Section 6

### Step 6 — Polish
- `.env.example` with `TAVILY_API_KEY` and `GROQ_API_KEY`
- Error handling: no API key set → clear message, not a stack trace
- README with setup + example usage + example output screenshot placeholder
- Add a `requirements.txt`: `httpx`, `typer`, `python-dotenv`, `groq`, `fastapi`, `uvicorn`

---

## 5. Environment Variables

```
TAVILY_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```
Both have free tiers — sign up at tavily.com and console.groq.com.

---

## 6. Frontend — Full Next.js Interface (not minimal, portfolio-grade)

This is a core deliverable, not a stretch goal. The backend (CLI + FastAPI) proves the engineering; the frontend is what a recruiter or non-technical person actually experiences, so it needs to feel like a real product, not a wrapped textbox.

### 6.1 Before writing any code
Read `/mnt/skills/public/frontend-design/SKILL.md` in full and follow its process: define a design plan (palette, type, layout, one signature element) before touching code, and self-critique it against generic AI-default looks (cream+serif+terracotta, near-black+neon accent, broadsheet-with-hairlines) before proceeding. Don't default to a generic chat-app look just because this is "a search UI" — ground the direction in what this product actually is: an instant-answer engine, not a chatbot.

### 6.2 Stack
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS
- Calls your FastAPI `/search` endpoint (Step 5 in Section 4)
- Deploy target: Vercel (you already have this workflow from TNB)

### 6.3 Required pages/states (this is what "complete" means here — not just a search box)
1. **Landing / search entry** — the hero moment; this is where the signature design element should live. One clear input, no clutter.
2. **Results / answer view** — synthesized answer with inline citation markers (e.g. `[1]`, `[2]`) that are clickable/hoverable, scrolling or expanding to a source list below with title, snippet, and link per source.
3. **Loading state** — since the pipeline does retrieval + LLM generation (a few seconds), design an intentional loading sequence (e.g. show "Searching the web…" → "Reading sources…" → "Writing answer…" as it progresses), not just a generic spinner.
4. **Empty / no-results state** — when the search API returns nothing usable, write this in the interface's voice: explain what happened, not just "no results".
5. **Error state** — API failure, timeout, or missing API key on the backend — explain what happened and what to do, never a raw stack trace.
6. **Search history / recent queries** (optional but adds real product feel) — client-side list of past queries the user can revisit in the session.

### 6.4 Interaction details worth getting right
- Citations in the answer text should visually connect to their source card (matching numbers, hover-highlight, or click-to-scroll) — this is the actual "signature" interaction of an answer engine, worth spending your design effort here rather than on decoration.
- Responsive down to mobile — test at 375px width.
- Visible keyboard focus states, and the search input should be keyboard-submittable (no mouse required).
- Respect `prefers-reduced-motion` for any loading animation.

### 6.5 Build order for the frontend
1. Design plan first (palette/type/layout/signature) — write it down before coding, per the skill.
2. Static layout with mock data (hardcode a sample answer + sources) — get the visual design right before wiring up the API.
3. Wire up the real `/search` API call, replacing mock data.
4. Add loading/empty/error states.
5. Polish interactions (citation linking, keyboard nav, mobile pass).
6. Deploy to Vercel, put the live link in the README.

---

## 7. Other Stretch Goals (after frontend is solid)

- Streaming responses (Groq supports streaming — pair with a streaming-in-progress UI state)
- A `--follow-up` / multi-turn mode that keeps conversation context across queries
- Cache repeated queries in SQLite/Supabase to avoid duplicate API calls

---

## 7. Instructions for Claude Code

When building this:
1. Scaffold the folder structure first (Step 1), confirm before writing logic.
2. Build and test `retriever.py` in isolation first — print raw results, verify the API works before touching the LLM step.
3. Then build `synthesizer.py`, test with a hardcoded set of results before wiring it to the live retriever.
4. Wire CLI last, once both pieces work independently.
5. Only build the FastAPI wrapper (Step 5) after the CLI works end-to-end.
6. Keep commits small: scaffold → retriever → synthesizer → CLI → API → polish.
