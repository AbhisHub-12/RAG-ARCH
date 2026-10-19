## Embeddings — turning meaning into numbers

An **embedding** is a list of numbers (a **vector**) that represents the *meaning* of a
piece of text. It's the trick that lets a computer compare ideas, not just match words.

### The core idea

A special model called an **embedding model** reads a chunk of text and outputs a vector
— often hundreds or thousands of numbers long. The magic property is:

> **Texts with similar meanings get similar vectors.**

So *"How do I reset my password?"* and *"I forgot my login credentials"* end up **close
together**, even though they barely share any words. That's why RAG can find relevant
information by *meaning* rather than exact keyword matches.

### A friendly mental picture

Imagine a giant map where every sentence is a dot. Sentences about dogs cluster in one
area, sentences about taxes in another. Embeddings are the **coordinates** of each dot.
To find text related to your question, you drop your question on the map and look at the
nearest dots. (Real embeddings live in hundreds of dimensions, not two — but the
intuition holds.)

### How "closeness" is measured

The most common measure is **cosine similarity** — it checks whether two vectors point
in the same *direction*. A score near **1** means "very similar in meaning," near **0**
means "unrelated." You don't need the math to use it; most vector databases compute it
for you.

### Key things to know as a beginner

- **Use the same embedding model everywhere.** Documents and questions must be embedded
  by the *same* model, or their vectors won't be comparable.
- **The model matters.** Better embedding models produce more meaningful "maps," which
  directly improves retrieval quality.
- **Dimensions are a trade-off.** More dimensions can capture more nuance but cost more
  storage and compute.

> **Beginner takeaway:** an embedding converts text into coordinates of meaning, so
> "find relevant text" becomes "find the nearest points." Everything in RAG's search
> step rests on this one idea.
