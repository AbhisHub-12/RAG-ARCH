import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Section from './components/Section.jsx'
import MarkdownBlock from './components/MarkdownBlock.jsx'
import FlowStrip from './components/FlowStrip.jsx'
import ArchitectureDiagram from './components/ArchitectureDiagram.jsx'
import Connections from './components/Connections.jsx'
import PipelineDiagram from './components/PipelineDiagram.jsx'
import RagPlayground from './components/RagPlayground.jsx'
import Quiz from './components/Quiz.jsx'
import Glossary from './components/Glossary.jsx'
import Footer from './components/Footer.jsx'
import { docs } from './data/docs.js'
import { quizzes } from './data/quizzes.js'

const CONCEPTS = [
  { key: 'chunking', title: 'Chunking', icon: '✂️', teaser: 'Split documents into bite-sized, searchable passages.' },
  { key: 'embeddings', title: 'Embeddings', icon: '🧭', teaser: 'Turn meaning into numbers so ideas can be compared.' },
  { key: 'vector-db', title: 'Vector database', icon: '🗄️', teaser: 'A search engine for meaning — fast nearest-neighbor lookups.' },
  { key: 'retrieval', title: 'Retrieval', icon: '🔎', teaser: 'Fetch the most relevant chunks for a question.' },
  { key: 'generation', title: 'Generation', icon: '✨', teaser: 'The LLM writes a grounded, cited answer.' },
]

function ConceptCard({ concept }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`concept ${open ? 'is-open' : ''}`}>
      <button className="concept-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="concept-icon">{concept.icon}</span>
        <span className="concept-titles">
          <strong>{concept.title}</strong>
          <span className="concept-teaser">{concept.teaser}</span>
        </span>
        <span className="concept-chevron">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="concept-body">
          <MarkdownBlock>{docs[concept.key]}</MarkdownBlock>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />

      <main>
        <Section id="what" kicker="Start here" title="What is RAG?">
          <MarkdownBlock>{docs['what-is-rag']}</MarkdownBlock>
        </Section>

        <Section id="why" kicker="Motivation" title="Why RAG?">
          <MarkdownBlock>{docs['why-rag']}</MarkdownBlock>
        </Section>

        <Section id="architecture" kicker="The main event" title="RAG architecture & how it works">
          <p className="section-lead">
            A RAG system has <strong>two phases</strong> — think of them as{' '}
            <em>getting the library ready</em>, then <em>answering a question</em>:
          </p>
          <FlowStrip
            tone="ingest"
            title="Phase 1 · Ingestion"
            note="offline · run once, ahead of time"
            steps={[
              { label: 'Documents', sub: 'PDFs · web · notes' },
              { label: 'Chunking', sub: 'split into passages' },
              { label: 'Embedding', sub: 'text → vectors' },
              { label: 'Vector Database', sub: 'store + index' },
            ]}
          />
          <FlowStrip
            tone="retrieve"
            title="Phase 2 · Retrieval + Generation"
            note="online · runs every question"
            steps={[
              { label: 'User question' },
              { label: 'Embed', sub: 'question → vector' },
              { label: 'Search', sub: 'find similar' },
              { label: 'Top-K chunks', sub: 'best matches' },
              { label: 'Augment', sub: 'build prompt' },
              { label: 'Generate', sub: 'LLM writes' },
              { label: 'Answer', sub: '+ citations' },
            ]}
          />

          <MarkdownBlock>{docs.architecture}</MarkdownBlock>

          <h3 className="block-title">The complete RAG workflow</h3>
          <p className="section-lead">
            The full picture: both phases and how every component connects. Arrows show the
            direction data flows. The <strong>vector database</strong> and the{' '}
            <strong>embedding model</strong> are shared across both phases — that's what ties
            ingestion to retrieval.
          </p>
          <ArchitectureDiagram />

          <Connections />

          <div className="callout">
            <span className="callout-tag">Interactive</span>
            Now step through just the five answer-time stages, one at a time:
          </div>
          <PipelineDiagram />
          <MarkdownBlock>{docs.pipeline}</MarkdownBlock>
        </Section>

        <Section id="theory" kicker="The why behind it" title="The theory behind RAG">
          <MarkdownBlock>{docs.theory}</MarkdownBlock>
        </Section>

        <Section id="concepts" kicker="Deep dive" title="The core components, up close">
          <p className="section-lead">
            Five building blocks power every RAG system. Expand each to see how it works and
            how it connects to the steps around it.
          </p>
          <div className="concepts">
            {CONCEPTS.map((c) => (
              <ConceptCard key={c.key} concept={c} />
            ))}
          </div>
        </Section>

        <Section id="playground" kicker="See it move" title="RAG Playground">
          <p className="section-lead">
            Ask the tiny help-desk a question and watch a full RAG cycle run — chunk match,
            retrieval scores, the assembled prompt, and the grounded answer. Everything runs
            in your browser; no API key, no data leaves the page.
          </p>
          <RagPlayground />
          <div className="divider" />
          <MarkdownBlock>{docs['hands-on']}</MarkdownBlock>
        </Section>

        <Section id="beyond" kicker="What's next" title="Beyond the basics">
          <MarkdownBlock>{docs['rag-anything']}</MarkdownBlock>
        </Section>

        <Section id="glossary" kicker="Reference" title="Searchable glossary">
          <Glossary />
        </Section>

        <Section id="recap" kicker="Optional" title="Quick recap">
          <p className="section-lead">
            A short, optional check — if you can answer these, you've got the core ideas.
          </p>
          <Quiz quiz={quizzes.final} />
        </Section>
      </main>

      <Footer />
    </>
  )
}
