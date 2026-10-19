import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Section from './components/Section.jsx'
import MarkdownBlock from './components/MarkdownBlock.jsx'
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
          <Quiz quiz={quizzes.basics} />
        </Section>

        <Section id="why" kicker="Motivation" title="Why RAG?">
          <MarkdownBlock>{docs['why-rag']}</MarkdownBlock>
          <Quiz quiz={quizzes.why} />
        </Section>

        <Section id="pipeline" kicker="How it works" title="The architecture & pipeline">
          <MarkdownBlock>{docs.architecture}</MarkdownBlock>
          <div className="callout">
            <span className="callout-tag">Interactive</span>
            Click through the five answer-time stages:
          </div>
          <PipelineDiagram />
          <MarkdownBlock>{docs.pipeline}</MarkdownBlock>
        </Section>

        <Section id="concepts" kicker="Deep dive" title="The core concepts">
          <p className="section-lead">
            Five building blocks power every RAG system. Expand each to learn it in plain
            English.
          </p>
          <div className="concepts">
            {CONCEPTS.map((c) => (
              <ConceptCard key={c.key} concept={c} />
            ))}
          </div>
          <Quiz quiz={quizzes.concepts} />
        </Section>

        <Section id="playground" kicker="Try it yourself" title="RAG Playground">
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

        <Section id="quiz" kicker="Test yourself" title="Final knowledge check">
          <Quiz quiz={quizzes.final} />
        </Section>
      </main>

      <Footer />
    </>
  )
}
