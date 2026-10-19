## The RAG architecture at a glance

A RAG system has **two phases**. Think of them as *"getting the library ready"* and
*"answering a question."*

### Phase 1 — Ingestion (offline, done ahead of time)

This is where you prepare your knowledge so it can be searched quickly. It happens
**before** any user asks anything, and you re-run it whenever your documents change.

```
Documents  →  Chunking  →  Embedding  →  Store in Vector Database
 (PDFs,       (split into    (turn each     (an index built for
  web pages,    small          chunk into     fast similarity
  notes…)       passages)      a vector)      search)
```

### Phase 2 — Retrieval + Generation (online, happens per question)

This runs **every time** a user asks something.

```
User question → Embed the question → Search the vector DB →
Top-K relevant chunks → Build a prompt (question + chunks) →
LLM generates the answer → Answer (optionally with citations)
```

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

The next pages walk through each block, one at a time. Start with **the pipeline**,
then dive into chunking, embeddings, vector databases, retrieval, and generation.
