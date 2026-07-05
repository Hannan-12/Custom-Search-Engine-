"""CLI entrypoint for the custom search engine.

Usage:
    python search.py "your question here"
    python search.py "your question" --num-results 8
    python search.py "your question" --raw        # skip the LLM, dump results

Flow: retrieve (Tavily) -> synthesize (Groq) -> format -> print.
"""

from __future__ import annotations

import typer
from dotenv import load_dotenv

from engine.errors import SearchEngineError
from engine.formatter import format_output, format_raw
from engine.retriever import search_web
from engine.synthesizer import synthesize

# Load .env before anything reads the API keys.
load_dotenv()

app = typer.Typer(
    add_completion=False,
    help="Perplexity-style search: ask a question, get a cited answer.",
)


@app.command()
def main(
    query: str = typer.Argument(..., help="The question to search for."),
    num_results: int = typer.Option(
        6, "--num-results", "-n", min=1, max=20, help="How many sources to fetch."
    ),
    raw: bool = typer.Option(
        False, "--raw", help="Skip the LLM and just print the search results."
    ),
) -> None:
    """Search the web and print a cited, synthesized answer."""
    try:
        results = search_web(query, num_results=num_results)

        if not results:
            typer.echo("No results found for that query.")
            raise typer.Exit(code=1)

        if raw:
            typer.echo(format_raw(results))
            return

        answer = synthesize(query, results)
        typer.echo(format_output(answer, results))

    except SearchEngineError as exc:
        # Missing keys, API failures, empty results — show a clean message,
        # not a stack trace.
        typer.secho(f"Error: {exc}", fg=typer.colors.RED, err=True)
        raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
