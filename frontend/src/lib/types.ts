// Shape of the data flowing between the FastAPI backend and the UI.

export type Source = {
  title: string;
  url: string;
  snippet?: string;
};

export type Agreement = "agree" | "mixed" | "single" | "none";

export type SearchResponse = {
  answer: string;
  sources: Source[];
  agreement?: Agreement;
  agreement_note?: string;
};

// The UI's view of a search: which query, and the result or failure.
export type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "done"; query: string; result: SearchResponse }
  | { status: "empty"; query: string }
  | { status: "error"; query: string; message: string };

// One token of a parsed answer: either prose text or a citation marker.
export type AnswerToken =
  | { kind: "text"; value: string }
  | { kind: "cite"; n: number };
