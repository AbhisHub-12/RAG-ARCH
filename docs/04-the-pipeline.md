## The RAG pipeline, step by step

When a user asks a question, a RAG system runs a short relay race. Here are the five
stages of the **answer-time** pipeline. Use the interactive diagram above to click
through each one — this page is the written companion.

### 1. Query

The user types a question, e.g. *"How do I reset my password?"* Nothing fancy yet —
this is just the raw text we're about to work with.

### 2. Embed the query

The question is turned into an **embedding** — a vector (a long list of numbers) that
captures its *meaning*. This is the same transformation we applied to every document
chunk during ingestion, so now the question and the documents live in the same
"meaning space" and can be compared.

### 3. Retrieve

We search the **vector database** for the chunks whose embeddings are **closest** to the
question's embedding. "Closest" means *most similar in meaning*. We keep the best few —
the **top-K** (say, the top 3 or 5). These are our candidate pieces of evidence.

### 4. Augment

We build the final prompt by **combining** the user's question with the retrieved
chunks, usually with an instruction like:

> *"Answer the question using only the context below. If the context doesn't contain the
> answer, say you don't know.*
> *Context: [chunk 1] [chunk 2] [chunk 3]*
> *Question: How do I reset my password?"*

This step is the **"Augmented"** in Retrieval-**Augmented** Generation.

### 5. Generate

The LLM reads that combined prompt and **writes the answer**, grounded in the retrieved
context. A good RAG system also returns **citations** pointing back to the source chunks,
so the user can verify the answer.

---

### The whole flow in one line

```
Query → Embed → Retrieve top-K → Augment prompt → Generate answer (+ citations)
```

### Why each step matters

- Skip **good chunking** and retrieval returns messy, half-relevant passages.
- Skip **good embeddings** and "closest in meaning" stops being meaningful.
- Skip the **augment** instruction and the model may ignore your context and hallucinate.
- Skip **citations** and users can't trust or verify the answer.

Every stage is simple on its own. The craft of building RAG is making each stage a
little better — which is exactly what the deep-dive pages cover next.
