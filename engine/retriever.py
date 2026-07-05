"""Retrieval layer: pull live web results from the Tavily Search API.

Tavily is built for LLM pipelines and returns clean snippets, so it's the
first-choice provider from the spec. This module knows nothing about the LLM —
it just turns a query into a list of {title, url, snippet} dicts.
"""

from __future__ import annotations

import os
import re

import httpx

from .errors import MissingAPIKeyError, RetrievalError

TAVILY_URL = "https://api.tavily.com/search"
TIMEOUT_SECONDS = 5.0
MAX_SNIPPET_CHARS = 800

# Matches markdown links: [visible text](https://url) -> keep "visible text".
_MD_LINK = re.compile(r"\[([^\]]+)\]\((?:[^)]+)\)")
# Matches leftover bare markdown emphasis/heading/bullet markers.
_MD_NOISE = re.compile(r"[*#`>]+")
# Collapses runs of whitespace (including newlines) into a single space.
_WHITESPACE = re.compile(r"\s+")


def search_web(query: str, num_results: int = 6) -> list[dict]:
    """Search the web and return up to ``num_results`` results.

    Each result is a dict with ``title``, ``url``, and ``snippet`` keys.

    Raises:
        MissingAPIKeyError: if ``TAVILY_API_KEY`` is not set.
        RetrievalError: on timeout, network failure, or a bad API response.
    """
    query = (query or "").strip()
    if not query:
        raise RetrievalError("Query is empty.")

    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        raise MissingAPIKeyError(
            "TAVILY_API_KEY is not set. Add it to your .env file "
            "(see .env.example). Get a free key at https://tavily.com"
        )

    payload = {
        "api_key": api_key,
        "query": query,
        "max_results": num_results,
        "search_depth": "basic",
    }

    try:
        response = httpx.post(TAVILY_URL, json=payload, timeout=TIMEOUT_SECONDS)
    except httpx.TimeoutException as exc:
        raise RetrievalError(
            f"Search timed out after {TIMEOUT_SECONDS:.0f}s."
        ) from exc
    except httpx.HTTPError as exc:
        raise RetrievalError(f"Search request failed: {exc}") from exc

    if response.status_code == 401:
        raise MissingAPIKeyError(
            "Tavily rejected the API key (401). Check TAVILY_API_KEY in .env."
        )
    if response.status_code != 200:
        raise RetrievalError(
            f"Tavily returned HTTP {response.status_code}: {response.text[:200]}"
        )

    try:
        data = response.json()
    except ValueError as exc:
        raise RetrievalError("Tavily returned a non-JSON response.") from exc

    results = _normalize(data.get("results", []))
    return results


def _normalize(raw_results: list[dict]) -> list[dict]:
    """Coerce Tavily's raw results into our {title, url, snippet} shape."""
    normalized: list[dict] = []
    for item in raw_results:
        url = (item.get("url") or "").strip()
        if not url:
            continue
        normalized.append(
            {
                "title": _clean_snippet(item.get("title") or url),
                "url": url,
                "snippet": _clean_snippet(item.get("content") or ""),
            }
        )
    return normalized


def _clean_snippet(text: str) -> str:
    """Strip markdown-link clutter and collapse whitespace.

    Tavily snippets are scraped from pages and often contain markdown links
    like ``[AI](https://...)`` and navigation noise. We keep the human-readable
    text, drop the URL clutter, and truncate very long snippets so the LLM
    context in the synthesis step stays clean and token-efficient.
    """
    text = _MD_LINK.sub(r"\1", text)      # [text](url) -> text
    text = _MD_NOISE.sub("", text)        # drop *, #, `, >, - markers
    text = _WHITESPACE.sub(" ", text).strip()
    if len(text) > MAX_SNIPPET_CHARS:
        text = text[:MAX_SNIPPET_CHARS].rsplit(" ", 1)[0] + "…"
    return text


if __name__ == "__main__":
    # Manual smoke test (Step 2 of the build plan: verify the API in isolation).
    # Run: python -m engine.retriever "your query"
    import json
    import sys

    from dotenv import load_dotenv

    load_dotenv()
    q = " ".join(sys.argv[1:]) or "what is retrieval augmented generation"
    print(json.dumps(search_web(q), indent=2))
