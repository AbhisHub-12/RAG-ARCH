## Hands-on: build a mental model of a tiny RAG system

Let's trace one question through a miniature RAG system from start to finish. You can
follow the exact same flow live in the **RAG Playground** above — this page explains what
you're seeing.

### Our tiny knowledge base

Imagine a company help-desk with just three notes:

- **Note A:** *"To reset your password, click 'Forgot password' on the login page and
  follow the email link. The link expires in 30 minutes."*
- **Note B:** *"Refunds are available within 30 days of purchase for orders over $20."*
- **Note C:** *"Our support team is available Monday to Friday, 9am to 6pm IST."*

### Step 0 — Ingestion (done ahead of time)

Each note is **chunked** (here each note is already small, so one chunk each),
**embedded** into a vector, and **stored** in the vector database with metadata like
`{source: "Note A"}`.

### The question

> *"I can't log in — how do I get a new password?"*

### Step 1 — Embed the question

The question becomes a vector capturing its meaning: something about *login* and
*password recovery*. Notice it shares almost no exact words with Note A ("reset",
"forgot") — yet they mean the same thing.

### Step 2 — Retrieve

The system compares the question's vector to all three note vectors:

| Chunk | Similarity to question | Picked? |
|-------|-----------------------|---------|
| Note A (password reset) | **high** | ✅ top result |
| Note C (support hours) | low–medium | maybe |
| Note B (refunds) | low | ❌ |

With **K = 1**, we keep **Note A**.

### Step 3 — Augment

We build the prompt:

```
Answer using only the context. Cite the source.
CONTEXT: [Note A] To reset your password, click 'Forgot password'...
QUESTION: I can't log in — how do I get a new password?
```

### Step 4 — Generate

The LLM responds, grounded in Note A:

> *"Click **'Forgot password'** on the login page and follow the link in the email. Note
> that the link expires after 30 minutes. (Source: Note A)"*

### What just happened

- The system found the right note **by meaning**, not keywords.
- The answer came **from your data**, not the model's memory.
- It included a **citation** you can verify.
- If you'd asked about something not in the notes, a good system would say **"I don't
  know."**

That's a complete RAG cycle. Everything beyond this — bigger corpora, better chunking,
re-ranking, hybrid search, multimodal content — is a refinement of these same five steps.
