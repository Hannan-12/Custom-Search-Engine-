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
- CORS enabled for `localhost:3000` (so a Next.js frontend can call it later)
- This is optional but sets you up to reuse this as a portfolio-ready mini-SaaS later (like GoHighReview)

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

## 6. Stretch Goals (only after core CLI + API work)

- Streaming responses (Groq supports streaming — nice for the API version)
- Simple Next.js frontend (chat-box style, reusing your existing Next.js conventions) so it becomes a full portfolio project like TNB/GoHighReview
- Add a `--follow-up` mode that keeps conversation context across queries
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
