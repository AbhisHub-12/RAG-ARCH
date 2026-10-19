## Retrieval — finding the right context

**Retrieval** is the step that takes a user's question and pulls back the most relevant
chunks from the vector database. It's the "R" in RAG and the part that most directly
determines answer quality: *if retrieval hands the model the wrong context, even a great
LLM will give a wrong answer.*

### The basic recipe

1. **Embed the question** with the same embedding model used for the documents.
2. **Search** the vector database for the nearest chunk vectors.
3. **Take the top-K** — the K most similar chunks (K is often 3–10).
4. **Pass them on** to the augment/generate steps.

### Choosing K (how many chunks to fetch)

- **Too few** — you might miss the chunk that actually holds the answer.
- **Too many** — you dilute the prompt with noise, raise cost, and can confuse the model.
- Start around **K = 3–5** and adjust based on results.

### Making retrieval smarter

Basic top-K works, but these techniques push quality further:

- **Re-ranking** — fetch a larger set first, then use a more precise (slower) model to
  **re-sort** them so the very best chunks land on top. A small re-ranker often gives a
  big quality boost.
- **Metadata filtering** — restrict the search ("only docs from 2026", "only the billing
  section") before similarity ranking.
- **Query rewriting** — clean up or expand a vague question before embedding it (e.g.
  turn "it broke again" into a fuller, searchable query).
- **Hybrid search** — combine semantic and keyword matching (see the vector database
  page).

### How do you know retrieval is good?

Two intuitive measures:

- **Recall** — did we actually fetch the chunk that contains the answer?
- **Precision** — of the chunks we fetched, how many were truly relevant?

Good retrieval is high on both: it finds the needle *and* doesn't drag in a haystack.

> **Beginner takeaway:** retrieval is quality control for the whole system. Get the right
> handful of chunks in front of the model, and generation becomes easy.
