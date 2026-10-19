## Beyond the basics: where RAG goes next

You now understand classic **text** RAG. Real-world documents and questions get messier,
so researchers and engineers have extended RAG in several directions. Here's a gentle,
beginner-level tour of what's next — no need to master these yet, just know they exist.

### Multimodal RAG — beyond plain text

Most documents aren't just text. They have **images, tables, charts, and equations**.
Traditional text-only RAG throws all of that away. **Multimodal RAG** can understand and
retrieve across these formats too.

A leading example is **[RAG-Anything](https://github.com/hkuds/rag-anything)** (from
HKUDS), an all-in-one multimodal RAG framework built on **LightRAG**. Instead of stitching
together 20 separate tools, it handles diverse content in one pipeline:

- **Text** — intelligent chunking and semantic retrieval.
- **Images** — a vision-language model (VLM) describes and reasons about pictures.
- **Tables** — extraction and reasoning over structured data.
- **Equations** — parsing mathematical formulas (e.g. LaTeX) and their meaning.

Its pipeline is a multi-stage flow: **document parsing → content analysis → knowledge
graph → intelligent retrieval**, with modality-aware ranking so a text question can still
pull back the right image, table, or formula. This matters for academic papers, financial
reports, and technical manuals — anywhere knowledge isn't only words.

### GraphRAG — retrieval over a knowledge graph

Instead of treating documents as a flat pile of chunks, **GraphRAG** builds a
**knowledge graph** of entities (people, products, concepts) and the relationships
between them. Retrieval can then *traverse* connections — great for questions that need
you to "connect the dots" across many documents.

### Agentic RAG — the model decides how to retrieve

In **agentic RAG**, the LLM acts as an **agent** that can decide *when* to search, *what*
to search for, search **multiple times**, use tools, and refine its query based on what it
found — rather than doing a single fixed retrieval. It's RAG with a planning loop on top.

### Re-ranking, hybrid search, and evaluation

Production systems layer in the refinements you met earlier:

- **Hybrid search** (semantic + keyword) for better recall.
- **Re-ranking** to put the best chunks first.
- **Evaluation** pipelines that score faithfulness, relevance, and groundedness so teams
  can improve systematically.

### Where to go from here

> Master the five basic steps first — **query, embed, retrieve, augment, generate** —
> then explore multimodal, graph, and agentic RAG. Every advanced technique is a smarter
> version of one of those same steps.

Suggested next stops: read the [RAG-Anything](https://github.com/hkuds/rag-anything)
README, then try building a tiny RAG app over your own notes using any vector database.
