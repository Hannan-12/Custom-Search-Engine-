"""Formatting layer: pretty-print results for the CLI.

Pure string formatting — no I/O, no network. Given an answer and the source
list, produce the terminal display described in the spec:

    Answer:
    <synthesized answer with [1][2] citations>

    Sources:
    [1] Title — url
    [2] Title — url
"""

from __future__ import annotations


def format_output(answer: str, results: list[dict]) -> str:
    """Format the synthesized answer plus its numbered source list.

    The source numbers match the [n] citations in the answer, since both are
    numbered in the same order the retriever returned them.
    """
    parts = ["Answer:", answer.strip(), "", "Sources:", format_sources(results)]
    return "\n".join(parts).rstrip() + "\n"


def format_raw(results: list[dict]) -> str:
    """Format just the source list, for the CLI's ``--raw`` mode (no LLM)."""
    if not results:
        return "No results found.\n"
    return "Sources:\n" + format_sources(results) + "\n"


def format_sources(results: list[dict]) -> str:
    """Render the numbered ``[n] Title — url`` source list."""
    if not results:
        return "(none)"
    lines: list[str] = []
    for i, r in enumerate(results, start=1):
        title = (r.get("title") or "").strip() or "Untitled"
        url = (r.get("url") or "").strip()
        lines.append(f"[{i}] {title} — {url}")
    return "\n".join(lines)


if __name__ == "__main__":
    # Manual smoke test — fully offline, no API key needed.
    sample_answer = (
        "Retrieval-augmented generation (RAG) connects an AI model with "
        "external knowledge bases [1] so LLMs give more relevant answers [2]."
    )
    sample_results = [
        {"title": "What is RAG? - IBM", "url": "https://www.ibm.com/topics/rag"},
        {"title": "RAG - Wikipedia", "url": "https://en.wikipedia.org/wiki/RAG"},
    ]

    print("=== format_output ===")
    print(format_output(sample_answer, sample_results))
    print("=== format_raw ===")
    print(format_raw(sample_results))
    print("=== format_output with no sources ===")
    print(format_output("The sources don't cover this.", []))
