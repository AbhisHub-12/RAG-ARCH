// Single source of truth for lesson prose: the markdown files in /docs are imported
// here as raw strings and rendered by the React app. Editing a file in /docs updates
// both the standalone GitHub-readable doc and the live site.
import whatIsRag from '../../docs/01-what-is-rag.md?raw'
import whyRag from '../../docs/02-why-rag.md?raw'
import architecture from '../../docs/03-architecture.md?raw'
import pipeline from '../../docs/04-the-pipeline.md?raw'
import chunking from '../../docs/05-chunking.md?raw'
import embeddings from '../../docs/06-embeddings.md?raw'
import vectorDb from '../../docs/07-vector-databases.md?raw'
import retrieval from '../../docs/08-retrieval.md?raw'
import generation from '../../docs/09-generation.md?raw'
import handsOn from '../../docs/10-hands-on-walkthrough.md?raw'
import ragAnything from '../../docs/11-rag-anything.md?raw'
import theory from '../../docs/12-theory.md?raw'

export const docs = {
  'what-is-rag': whatIsRag,
  'why-rag': whyRag,
  architecture,
  pipeline,
  chunking,
  embeddings,
  'vector-db': vectorDb,
  retrieval,
  generation,
  'hands-on': handsOn,
  'rag-anything': ragAnything,
  theory,
}
