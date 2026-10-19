## How the two phases fit together

You just saw the two phases above: **ingestion** runs *offline*, ahead of time — you
re-run it whenever your documents change — and **retrieval + generation** runs *online*,
every single time a user asks a question. Here's what makes splitting the work this way
so powerful.

### The key architectural insight: retrieval and generation are *decoupled*

This is the idea that makes RAG so practical and durable:

> The part that **finds information** and the part that **writes the answer** are
> separate, swappable components.

Because they're decoupled, you can:

- Swap the **embedding model** without touching the LLM.
- Change the **vector database** without rewriting your prompts.
- Adjust **chunk sizes** or add a **re-ranking** step independently.
- Upgrade the **LLM** while keeping your whole knowledge index as-is.

### The seven building blocks

Most production RAG pipelines are a chain of small, independent pieces:

1. **Ingestion** — pull in raw data (PDFs, web pages, database rows, APIs).
2. **Chunking** — split text into manageable passages, add metadata.
3. **Embedding** — convert each chunk into a vector (a list of numbers).
4. **Vector store** — persist those vectors and search them fast.
5. **Retrieval** — given a query, fetch the top-K most similar chunks.
6. **Generation** — the LLM writes the final answer from those chunks.
7. **Orchestration / API** — the glue that ties it together and serves users.

### What flows between the components (the data contract)

An architecture is not just boxes — it's what travels on the **arrows between them**. At
each hop the data changes form. Following that transformation is the clearest way to
understand how RAG connects end to end:

| Connection | What travels on it |
|------------|--------------------|
| Documents → Chunking | **raw text** pulled from your sources |
| Chunking → Embedding | **text chunks** (small passages + metadata) |
| Embedding → Vector DB | **chunk vectors** (numbers) stored with their text — this is the *write* |
| User Query → Embed Query | the **question text** |
| Embed Query → Vector Search | the **query vector** |
| Vector DB → Vector Search | the **stored vectors** the search compares against — this is the *read* |
| Vector Search → Top-K | **ranked candidate chunks** |
| Top-K → Augment | the **best K chunks** (text + sources) |
| Augment → LLM | the **assembled prompt** (instruction + context + question) |
| LLM → Answer | the **generated answer** (+ citations) |

Notice the two special connections that aren't a single left-to-right step:

- The **Vector Database** is written by ingestion and read by retrieval — it's the shared
  storage bridge between the two phases.
- The **embedding model** is used in *both* phases (on chunks during ingestion, on the
  question during retrieval). It must be the **same** model both times, so documents and
  questions land in the same "meaning space" and can actually be compared.

The interactive diagram below makes all of this visible — click any box to see its role,
and follow the arrows to trace the data.

### Next

The next pages walk through each block in depth, then explain **the theory behind RAG** —
why embeddings capture meaning, why nearest-neighbor search finds relevant text, and why
grounding generation in retrieved context reduces hallucination.
