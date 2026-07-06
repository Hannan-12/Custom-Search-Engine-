# Answer Engine — Remaining Work Checklist

Consolidated list of what's left to do, based on live testing so far. Hand this to Claude Code alongside the original build guide.

---

## 1. Finish Testing (do these first)

- [ ] **Error state** — stop the FastAPI server mid-session, submit a query from the frontend, confirm the UI shows a clear, human-readable message (not a blank screen, not a raw stack trace, not an infinite spinner)
- [ ] **Empty/no-results state** — try a deliberately obscure or nonsense query and confirm the UI handles "no good results found" gracefully, in the interface's own voice

---

## 2. Bug Fixes (found during testing)

- [ ] **Input sanitization** — stray trailing quote (`"`) character has appeared in the search box after typing/pasting certain queries. Check the input handling — trim stray punctuation, or investigate why it's being appended.
- [ ] **Prompt tightening** — simple factual questions (e.g. "what is the capital of Pakistan") are producing overly long answers with 5 sources cited and a redundant closing sentence restacking all citations. Update the system prompt: *"Be concise. For simple factual questions, answer in 1-2 sentences. Don't repeat all citations in a summary sentence at the end. Save longer, multi-source explanations for genuinely ambiguous or disputed questions."*
- [ ] **Citation reuse bug check** — same source number has been cited for two separate/different claims within one answer. Confirm the hover/click behavior on that citation still resolves correctly, and that this isn't a sign the LLM is conflating unrelated claims under one source.
- [ ] **Source quality filtering** — low-authority sources (e.g. quiz sites, social media) have shown up in results alongside credible ones (Wikipedia, Britannica, government sites). Either restrict Tavily's request to prefer higher-authority domains, or add prompt guidance to deprioritize weak sources in the citation order when better ones are available.

---

## 3. Real Differentiators (pick 1–2, don't try to do all of these)

- [ ] **Confidence / source-agreement scoring** — when multiple sources are retrieved, show something like "3 sources found — 2 agree within range, 1 outlier" instead of just blending numbers into prose. Directly demoable using the population-of-Islamabad test case already run.
- [ ] **"Show your work" toggle** — a button/expand option to reveal the raw retrieved chunks/snippets that fed the answer, not just the final source cards. Good for interviews — shows the retrieval step, not just the polished output.

---

## 4. Portfolio Polish (do last, but don't skip)

- [ ] **README** — include:
  - Architecture diagram (text-based is fine)
  - Why Tavily + Groq were chosen
  - Screenshots from real test cases already run (capital-of-Pakistan vs. population-of-Islamabad — one clean answer, one contradiction-handling answer)
  - A "known limitations" section (documents what doesn't work perfectly, on purpose — this is what separates a demo from a documented engineering project)
- [ ] **Deploy it** — frontend to Vercel, backend (FastAPI) to a free host that supports it (Render or Railway), so the project is a live clickable link, not just localhost screenshots
- [ ] **Rate limiting / API key safety** — since this will be public once deployed, add basic rate limiting on the `/search` endpoint so the Tavily/Groq free-tier quota can't be drained by bots or abuse

---

## Instructions for Claude Code

Work through sections in order: finish testing (Section 1) → fix bugs (Section 2) → add one or two differentiators (Section 3) → polish and deploy (Section 4). Don't skip straight to Section 4 — the bug fixes and differentiators are what make the deployed version worth showing.
