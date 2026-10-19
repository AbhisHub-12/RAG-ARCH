// The five answer-time stages of the RAG pipeline, used by the interactive diagram.
export const pipelineStages = [
  {
    id: 'query',
    label: 'Query',
    icon: '💬',
    short: 'The user asks a question.',
    detail:
      "The raw question from the user — e.g. \"How do I reset my password?\" Nothing has happened yet; this is the text we're about to work with.",
  },
  {
    id: 'embed',
    label: 'Embed',
    icon: '🧭',
    short: 'Turn the question into a vector of meaning.',
    detail:
      'The question is converted into an embedding — a list of numbers capturing its meaning — using the same model that embedded every document chunk. Now the question and the documents live in the same "meaning space".',
  },
  {
    id: 'retrieve',
    label: 'Retrieve',
    icon: '🔎',
    short: 'Find the most similar chunks.',
    detail:
      'We search the vector database for the chunks whose embeddings are closest in meaning to the question. We keep the best few — the top-K (say 3–5). These are our candidate pieces of evidence.',
  },
  {
    id: 'augment',
    label: 'Augment',
    icon: '➕',
    short: 'Add the chunks to the prompt.',
    detail:
      'We combine the user\'s question with the retrieved chunks and an instruction like "Answer using only the context below." This is the "Augmented" in Retrieval-Augmented Generation.',
  },
  {
    id: 'generate',
    label: 'Generate',
    icon: '✨',
    short: 'The LLM writes the grounded answer.',
    detail:
      'The LLM reads the combined prompt and writes an answer grounded in the retrieved context — ideally with citations pointing back to the sources so the user can verify it.',
  },
]
