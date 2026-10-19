## The theory behind RAG — why it actually works

You've seen *what* the components are. This page explains the *theory* underneath them —
the handful of ideas that make RAG work at all. It stays beginner-friendly, but it's the
"why," not just the "what."

### 1. Two kinds of memory: parametric vs. non-parametric

An LLM stores everything it "knows" inside its **weights** — billions of numbers fixed at
training time. This is called **parametric memory**. It's powerful but has three built-in
limits: you can't easily edit it, you can't see where a fact came from, and it stops at
the training cutoff.

RAG adds a second kind: **non-parametric memory** — an external store (your documents)
that the model reads *at the moment of answering*. The whole theory of RAG is this split:

> **Separate what the system *knows* (an editable store) from how it *reasons and writes*
> (the model).** Knowledge becomes data you control; the model becomes a reasoning engine
> you point at that data.

Everything else below is the machinery that makes this split work.

### 2. Why text can turn into meaningful numbers (the embedding idea)

For a computer to "find relevant text," it needs to compare *meaning*. The key theory is
the **distributional hypothesis**: words and sentences that appear in similar contexts
tend to mean similar things — *"you shall know a word by the company it keeps."*

Embedding models are trained on huge amounts of text so that this hypothesis becomes
geometry: they learn to map each piece of text to a point in a high-dimensional space
such that **texts with similar meaning land near each other**. Meaning becomes *position*.

So "reset my password" and "I forgot my login" end up as nearby points — not because they
share words, but because they're used in similar ways.

### 3. Meaning as geometry: vector space and similarity

Each text becomes a **vector** — a point in a space with many dimensions (often 384 to
3072). You can picture a 2-D version: related ideas cluster together, unrelated ideas sit
far apart. Real embeddings just do this in hundreds of dimensions so they can capture many
independent shades of meaning at once.

To measure "how related," RAG usually uses **cosine similarity**, which compares the
*direction* two vectors point (their angle), not their length. Same direction ≈ same
meaning (score near 1); perpendicular ≈ unrelated (score near 0). This is the exact math
behind "find the closest chunks."

### 4. Retrieval = nearest-neighbor search

Finding relevant context is now a geometry problem: **given the question's vector, find the
nearest chunk vectors.**

Doing this exactly means comparing the query to *every* stored vector — fine for hundreds,
far too slow for millions. So vector databases use **Approximate Nearest Neighbor (ANN)**
algorithms (indexes like HNSW graphs or IVF partitions) that find the closest points
*almost* perfectly but *enormously* faster. The theory here is a deliberate trade:

> Give up a tiny bit of accuracy (recall) to gain a huge amount of speed (latency). Tuning
> that trade-off is a core part of building production RAG.

### 5. Generation = answering *conditioned on* the evidence

An LLM is, at heart, a model of probability: given some text, it predicts the most likely
next piece of text. Written compactly, it estimates `P(next token | everything so far)`.

RAG changes *what comes before*. Instead of just the question, the model now sees
**instruction + retrieved context + question**. So it's effectively computing:

```
P( answer | instruction, retrieved context, question )
```

When relevant evidence sits right there in the context, the model's most probable
continuation is to *use that evidence*. This is **grounding**: the retrieved text pulls the
model's output toward evidence-supported answers and away from invented ones. That single
shift — conditioning generation on retrieved facts — is why RAG reduces hallucination.

### 6. The connection that ties it all together: a shared coordinate system

Here's the deepest "how it connects" insight. Ingestion and retrieval only work together
because they share **one embedding model**. The documents and the question must be mapped
by the *same* model into the *same* vector space — otherwise "nearest" means nothing,
because the two sets of vectors wouldn't share a coordinate system.

So the architecture has two shared bridges between its phases:

- **The embedding model** — the common "ruler" that places both chunks and questions in the
  same meaning-space.
- **The vector database** — the shared store that ingestion *writes* and retrieval *reads*.

Remove either bridge and the two phases can't talk to each other.

### 7. Why decoupling is the whole point

Because the knowledge store and the reasoning model are separate, you can:

- **Update knowledge instantly** — edit documents, no retraining.
- **Swap parts independently** — change the embedding model, vector DB, or LLM on their own.
- **Attribute every answer** — each response traces back to specific retrieved sources.

That modularity is the architectural theory that makes RAG practical, durable, and
trustworthy — and it's exactly what the diagram on this page is showing you.
