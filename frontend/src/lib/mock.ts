import type { SearchResponse } from "./types";

// Sample data used to get the visual design right before wiring the real API.
export const MOCK_RESULT: SearchResponse = {
  answer:
    "Retrieval-augmented generation (RAG) connects an AI model with external " +
    "knowledge bases [1] so large language models can retrieve and incorporate " +
    "new information from outside their training data before responding [2]. " +
    "This makes answers more relevant and lets the model cite specific sources " +
    "instead of relying on memory alone [1, 3]. Because the knowledge lives " +
    "outside the model, it can be updated without retraining [3].",
  sources: [
    {
      title: "What is RAG (Retrieval-Augmented Generation)? — IBM",
      url: "https://www.ibm.com/think/topics/retrieval-augmented-generation",
    },
    {
      title: "Retrieval-augmented generation — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
    },
    {
      title: "What is RAG? — AWS",
      url: "https://aws.amazon.com/what-is/retrieval-augmented-generation",
    },
  ],
};

export const MOCK_QUERY = "what is retrieval augmented generation";
