## RAG glossary

Plain-English definitions of the terms used throughout this guide. The site above lets
you search and filter these interactively.

- **RAG (Retrieval-Augmented Generation)** — a technique where an LLM retrieves relevant
  information from a knowledge source and uses it to generate a grounded answer.
- **LLM (Large Language Model)** — the AI that generates text, e.g. the model behind a
  chat assistant.
- **Hallucination** — when an LLM confidently makes up information that isn't true.
- **Embedding** — a list of numbers (a vector) representing the meaning of a piece of
  text, so meanings can be compared mathematically.
- **Vector** — an ordered list of numbers; here, the numeric form of a text's meaning.
- **Embedding model** — the model that converts text into embeddings.
- **Chunk** — a small passage a document is split into for storage and retrieval.
- **Chunking** — the process of splitting documents into chunks.
- **Overlap** — shared text at the edges of neighboring chunks so ideas aren't cut off.
- **Metadata** — extra info stored with a chunk (source, page, date) used for citations
  and filtering.
- **Vector database (vector store)** — a database built to store embeddings and find the
  most similar ones quickly.
- **ANN (Approximate Nearest Neighbor)** — fast search that finds the closest vectors
  approximately, trading a little accuracy for big speed gains.
- **Cosine similarity** — a common way to measure how similar two vectors are by their
  direction (≈1 = very similar, ≈0 = unrelated).
- **Retrieval** — fetching the most relevant chunks for a query.
- **Top-K** — the K most similar chunks kept from a search (e.g. top 3).
- **Re-ranking** — re-sorting retrieved chunks with a more precise model so the best ones
  come first.
- **Hybrid search** — combining semantic (vector) search with keyword (lexical) search.
- **Query rewriting** — rephrasing or expanding a user's question before embedding it.
- **Augmentation** — adding retrieved context to the prompt before generation.
- **Generation** — the LLM writing the final answer from the augmented prompt.
- **Grounding** — basing an answer on retrieved evidence rather than the model's memory.
- **Citation** — a reference to the source a piece of an answer came from.
- **Context window** — the maximum amount of text an LLM can read at once.
- **Fine-tuning** — retraining a model's weights to change its behavior or style
  (different from RAG, which changes the information available).
- **Ingestion** — the offline phase of loading, chunking, embedding, and storing data.
- **Faithfulness** — how well an answer sticks to the retrieved context without inventing.
- **Recall** — whether retrieval found the chunk that actually holds the answer.
- **Precision** — how many of the retrieved chunks were truly relevant.
- **Multimodal RAG** — RAG that handles images, tables, and equations, not just text.
- **GraphRAG** — RAG that retrieves over a knowledge graph of entities and relationships.
- **Agentic RAG** — RAG where the model decides when and how to retrieve, often in a loop.
- **Knowledge graph** — a network of entities and the relationships connecting them.
- **VLM (Vision-Language Model)** — a model that understands both images and text.
