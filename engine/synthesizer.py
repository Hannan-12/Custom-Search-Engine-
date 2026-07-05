"""Synthesis layer: turn search results into a cited answer using an LLM.

This module takes the {title, url, snippet} results from the retriever, builds
a numbered source block, and asks Groq's Llama model to answer using ONLY those
sources with inline [n] citations. It knows nothing about how the results were
fetched — it can be tested in isolation with hardcoded results.
"""

from __future__ import annotations

import os

from .errors import MissingAPIKeyError, SynthesisError

MODEL = "llama-3.3-70b-versatile"
TIMEOUT_SECONDS = 30.0

SYSTEM_PROMPT = (
    "You are a search assistant. Answer the user's question using ONLY the "
    "numbered sources below. Cite every claim with its source number in "
    "brackets, e.g. [1]. If the sources don't contain enough information, say "
    "so explicitly. Be concise — 3-5 sentences unless the question needs more."
)


def synthesize(query: str, results: list[dict]) -> str:
    """Synthesize a cited answer to ``query`` from search ``results``.

    Args:
        query: The user's original question.
        results: A list of {title, url, snippet} dicts from the retriever.

    Returns:
        A plain-text answer with inline [n] citations.

    Raises:
        MissingAPIKeyError: if ``GROQ_API_KEY`` is not set.
        SynthesisError: if there are no results or the LLM call fails.
    """
    query = (query or "").strip()
    if not query:
        raise SynthesisError("Query is empty.")
    if not results:
        raise SynthesisError("No sources to synthesize from.")

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise MissingAPIKeyError(
            "GROQ_API_KEY is not set. Add it to your .env file "
            "(see .env.example). Get a free key at https://console.groq.com"
        )

    # Import here so the module loads even if `groq` isn't installed yet,
    # and so a missing key raises our clean error before we need the SDK.
    try:
        from groq import Groq
    except ImportError as exc:  # pragma: no cover - install-time guard
        raise SynthesisError(
            "The 'groq' package is not installed. Run: pip install groq"
        ) from exc

    context = build_context(results)
    user_message = f"Question: {query}\n\nSources:\n{context}"

    client = Groq(api_key=api_key, timeout=TIMEOUT_SECONDS)
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
        )
    except Exception as exc:  # groq raises a variety of error subclasses
        raise SynthesisError(f"LLM request failed: {exc}") from exc

    answer = (completion.choices[0].message.content or "").strip()
    if not answer:
        raise SynthesisError("LLM returned an empty answer.")
    return answer


def build_context(results: list[dict]) -> str:
    """Build the numbered source block fed to the LLM.

    Each line looks like: ``[1] Title — snippet (url)``. The numbering here is
    the same numbering the model is told to cite with, so the [n] in the answer
    lines up with the source list the CLI/API prints.
    """
    lines: list[str] = []
    for i, r in enumerate(results, start=1):
        title = (r.get("title") or "").strip() or "Untitled"
        snippet = (r.get("snippet") or "").strip()
        url = (r.get("url") or "").strip()
        lines.append(f"[{i}] {title} — {snippet} ({url})")
    return "\n".join(lines)


if __name__ == "__main__":
    # Manual smoke test (Step 3 of the build plan: test with HARDCODED results
    # before wiring to the live retriever). Run: python -m engine.synthesizer
    from dotenv import load_dotenv

    load_dotenv()

    sample_results = [
        {
            "title": "What is RAG? - IBM",
            "url": "https://www.ibm.com/topics/retrieval-augmented-generation",
            "snippet": (
                "Retrieval-augmented generation (RAG) connects an AI model with "
                "external knowledge bases so LLMs give more relevant answers."
            ),
        },
        {
            "title": "Retrieval-augmented generation - Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
            "snippet": (
                "RAG lets large language models retrieve and incorporate new "
                "information from external data sources before responding."
            ),
        },
    ]

    print("--- Context sent to LLM ---")
    print(build_context(sample_results))
    print("\n--- Synthesized answer ---")
    print(synthesize("What is retrieval-augmented generation?", sample_results))
