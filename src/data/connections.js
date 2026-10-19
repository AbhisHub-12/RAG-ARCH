// Every connection in the RAG architecture, grouped by phase. Explains what data
// travels on each arrow and why the connection exists — the "how it connects" view.

export const connectionGroups = [
  {
    phase: 'Phase 1 · Ingestion (offline)',
    tone: 'ingest',
    edges: [
      { from: 'Documents', to: 'Chunking', carries: 'raw text', why: 'Large sources are pulled in as plain text so they can be broken into retrievable pieces.' },
      { from: 'Chunking', to: 'Embedding', carries: 'text chunks', why: 'Each small passage (with its source metadata) is sent to the embedding model one by one.' },
      { from: 'Embedding', to: 'Vector DB', carries: 'chunk vectors (+ text)', why: 'The WRITE step: every chunk\'s vector is stored and indexed alongside its text, ready to be searched.' },
    ],
  },
  {
    phase: 'Shared bridges (connect both phases)',
    tone: 'shared',
    edges: [
      { from: 'Embedding model', to: 'both phases', carries: 'the same transformation', why: 'The SAME model embeds chunks (ingestion) and the question (retrieval), so both land in one shared meaning-space and can be compared. Different models would not line up.' },
      { from: 'Vector DB', to: 'Vector Search', carries: 'stored vectors', why: 'The READ step: retrieval searches the vectors that ingestion wrote. The database is the storage bridge between the two phases.' },
    ],
  },
  {
    phase: 'Phase 2 · Retrieval + Generation (online)',
    tone: 'retrieve',
    edges: [
      { from: 'User Query', to: 'Embed Query', carries: 'the question text', why: 'The user\'s raw question enters the pipeline.' },
      { from: 'Embed Query', to: 'Vector Search', carries: 'the query vector', why: 'The question is embedded into the same space as the chunks so "closeness" is meaningful.' },
      { from: 'Vector Search', to: 'Top-K', carries: 'ranked candidates', why: 'The search returns chunks ordered by similarity; we keep the best few (and may re-rank them).' },
      { from: 'Top-K', to: 'Augment', carries: 'best K chunks', why: 'The selected chunks (text + sources) become the evidence for the answer.' },
      { from: 'Augment', to: 'LLM', carries: 'the assembled prompt', why: 'Instruction + retrieved context + question are combined into one prompt for the model.' },
      { from: 'LLM', to: 'Answer', carries: 'generated answer', why: 'The model writes an answer grounded in the context, ideally with citations back to the sources.' },
    ],
  },
]
