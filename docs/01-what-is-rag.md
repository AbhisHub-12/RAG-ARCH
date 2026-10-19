## What is RAG?

**RAG** stands for **Retrieval-Augmented Generation**. It's a way of making a large
language model (LLM) — the kind of AI behind chat assistants — answer questions using
**information you give it on the spot**, instead of relying only on what it memorized
during training.

> **The open-book exam analogy**
>
> Imagine two students taking the same test:
>
> - **Student A** answers purely from memory. If they forgot something, they guess —
>   sometimes confidently, sometimes wrongly.
> - **Student B** is allowed to *open the textbook*, find the relevant page, and answer
>   using what they just read.
>
> A plain LLM is Student A. **RAG turns it into Student B.**

### Breaking down the name

| Word | What it means in plain English |
|------|-------------------------------|
| **Retrieval** | Go *find* the most relevant pieces of information from a knowledge source. |
| **Augmented** | *Add* those pieces to the question before the AI answers. |
| **Generation** | The AI *writes* an answer, now grounded in the retrieved facts. |

So the whole idea in one sentence:

> **RAG = look things up first, then let the AI write the answer using what it found.**

### Why this is a big deal

A normal LLM only knows what was in its training data, frozen at some point in the past.
It can't see your company's documents, today's news, or that PDF you uploaded five
minutes ago. RAG gives the model an **external memory** it can search at answer-time —
without retraining the model at all.

### A tiny concrete example

You ask: *"What is our refund policy for orders over $100?"*

1. **Retrieve** — the system searches your company's help docs and pulls the paragraph
   about refunds.
2. **Augment** — it attaches that paragraph to your question.
3. **Generate** — the LLM reads the paragraph and replies with the exact policy, quoting
   the real rule instead of guessing.

That's RAG. The rest of this guide unpacks *how* each of those three steps actually works.
