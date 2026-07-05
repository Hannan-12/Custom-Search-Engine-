"""Shared exception types for the search engine.

Using a small hierarchy lets the CLI and API catch engine failures and turn
them into clean, user-facing messages instead of raw stack traces.
"""


class SearchEngineError(Exception):
    """Base class for all engine failures."""


class MissingAPIKeyError(SearchEngineError):
    """A required API key is not set in the environment."""


class RetrievalError(SearchEngineError):
    """The search API call failed (network, timeout, or bad response)."""


class SynthesisError(SearchEngineError):
    """The LLM call failed."""
