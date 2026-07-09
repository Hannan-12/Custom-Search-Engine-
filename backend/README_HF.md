---
title: Answer Engine API
emoji: 🔎
colorFrom: gray
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Answer Engine — Backend API

FastAPI backend for the Answer Engine: retrieve → synthesize → cited answer.

This Space runs the Docker image built from the `Dockerfile` in this folder and
serves the API on port 7860.

## Endpoints
- `GET /health` — liveness check
- `POST /search` — `{ "query": "..." }` → `{ answer, sources, agreement, ... }`
- `GET /docs` — interactive API docs

## Required secrets (set in Space Settings → Variables and secrets)
- `TAVILY_API_KEY`
- `GROQ_API_KEY`
- `ALLOWED_ORIGINS` — your frontend origin, e.g. `https://your-app.vercel.app`

When you create the Space, rename this file to `README.md` at the Space root so
Hugging Face reads the config header above.
