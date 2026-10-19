## Generation — writing the grounded answer

**Generation** is the final step: the LLM reads the user's question *plus* the retrieved
chunks and writes the answer. Because the facts are supplied in the prompt, the model's
job shifts from "remember everything" to "**read and explain what's in front of me**."

### How the prompt is assembled

A RAG prompt almost always has three parts:

1. **Instructions** — how to behave, e.g. *"Answer using only the context below. If it's
   not there, say you don't know. Cite your sources."*
2. **Context** — the top-K retrieved chunks, often with their source labels.
3. **The question** — what the user actually asked.

A simple template looks like:

```
You are a helpful assistant. Answer the QUESTION using only the CONTEXT.
If the answer isn't in the context, say you don't know.

CONTEXT:
[1] (from onboarding.pdf, p.3) ...chunk text...
[2] (from faq.md) ...chunk text...

QUESTION: How do I reset my password?
```

### Grounding is what makes it trustworthy

The instruction *"use only the context"* is the safety rail that keeps the model honest.
Combined with good retrieval, it's what makes RAG answers **factual and verifiable**
instead of confidently invented.

### Citations

Because each chunk carries metadata, the model can reference its sources — *"According to
onboarding.pdf (p.3)…"* — or the app can show source links beside the answer. This lets
users **check** the answer, which is one of RAG's biggest advantages over a plain LLM.

### Handling "I don't know"

A well-built RAG system is comfortable saying it **can't find** the answer when retrieval
comes back empty or weak. That honesty is a feature, not a failure — it prevents the most
dangerous kind of hallucination: a confident wrong answer.

### A quick word on evaluation

Teams judge RAG answers on things like:

- **Faithfulness** — does the answer stick to the retrieved context (no invented facts)?
- **Relevance** — does it actually address the question?
- **Groundedness / citations** — can each claim be traced to a source?

> **Beginner takeaway:** generation is where retrieval pays off. Give the model clear
> instructions, the right context, and a way to cite — and you get answers that are both
> helpful and trustworthy.
