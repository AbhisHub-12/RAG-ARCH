## Vector databases — where embeddings live

Once every chunk is an embedding, you need somewhere to **store** all those vectors and
**search** them fast. That's a **vector database** (or "vector store").

### What makes it special

A normal database is great at exact matches ("find the row where id = 42"). A vector
database is built for a different question:

> *"Of my millions of vectors, which ones are **closest in meaning** to this one?"*

Checking every vector one by one would be too slow at scale, so vector databases use
clever indexes (with names like **HNSW** or **IVF**) that find the nearest neighbors
**approximately but very quickly**. This is called **approximate nearest neighbor (ANN)
search**.

### What it stores for each chunk

- The **embedding** (the vector).
- The original **text** of the chunk.
- The **metadata** (source, page, date, tags…).

So when retrieval finds a matching vector, it can hand back the actual text *and* tell
you where it came from.

### Hybrid search: best of both worlds

Pure vector search is great at *meaning* but can miss exact terms (like a product code
"X-1000" or a specific name). **Hybrid search** combines:

- **Vector (semantic) search** — matches meaning, and
- **Keyword (lexical) search** — matches exact words,

then blends the scores. For many real systems, hybrid search noticeably beats either
method alone.

### Popular options (you don't need to memorize these)

Managed services and libraries include **Pinecone, Weaviate, Milvus, Qdrant, Chroma**,
and **pgvector** (vectors inside PostgreSQL). They all do the same core job; they differ
in hosting, scale, and features.

> **Beginner takeaway:** a vector database is a search engine for *meaning*. It keeps
> your embeddings plus their text and metadata, and returns the closest matches in
> milliseconds — the engine behind RAG's "retrieve" step.
