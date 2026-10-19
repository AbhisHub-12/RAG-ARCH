## Chunking — splitting documents into bite-sized pieces

You can't hand a model a whole 300-page manual for every question. So during ingestion
we split documents into smaller passages called **chunks**. Chunking is often the single
highest-leverage decision in a RAG pipeline — get it wrong and everything downstream
suffers.

### Why chunk at all?

- **Precision** — a small, focused chunk is more likely to be *exactly* about the answer,
  so retrieval is sharper.
- **Context limits** — the LLM can only read so much text at once. Small chunks let you
  fit several *relevant* pieces instead of one giant blob.
- **Cost & speed** — less irrelevant text in the prompt means faster, cheaper answers.

### The Goldilocks problem

| Chunk size | Risk |
|------------|------|
| **Too small** | A chunk loses its surrounding context and becomes hard to understand on its own. |
| **Too large** | A chunk mixes several topics, so "relevance" gets blurry and you waste prompt space. |
| **Just right** | Each chunk is one coherent idea — usually a paragraph or a few sentences. |

### Common chunking strategies

- **Fixed-size** — split every N characters or tokens (e.g. 500 tokens). Simple, but can
  cut sentences in half.
- **With overlap** — let chunks share a little text at their edges (e.g. 50-token
  overlap) so an idea split across a boundary isn't lost.
- **Semantic / structural** — split on natural boundaries like paragraphs, headings, or
  sentences, so each chunk is a complete thought.

### Don't forget metadata

Along with the text, store useful **metadata** on each chunk: the source document, page
number, title, date, section. This powers citations ("from *Manual.pdf*, page 12") and
lets you **filter** retrieval (e.g. "only the 2026 docs").

> **Beginner takeaway:** start with paragraph-ish chunks plus a small overlap, keep the
> source metadata, and tune from there once you see what retrieval returns.
