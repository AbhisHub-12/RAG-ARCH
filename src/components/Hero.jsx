import { motion } from 'framer-motion'

const WORDS = [
  { k: 'Retrieve', d: 'find relevant info' },
  { k: 'Augment', d: 'add it to the prompt' },
  { k: 'Generate', d: 'write a grounded answer' },
]

const LEARN = [
  'What RAG is',
  'Why it beats a plain LLM',
  'The full architecture',
  'How every piece connects',
  'The theory behind it',
  'A hands-on walkthrough',
]

export default function Hero() {
  const go = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <header id="top" className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <motion.div
        className="hero-inner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="hero-badge">Beginner-friendly · interactive</span>
        <h1 className="hero-title">
          RAG, explained <span className="grad">from zero</span>
        </h1>

        <div className="rag-words">
          {WORDS.map((w, i) => (
            <motion.div
              key={w.k}
              className="rag-word"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
            >
              <span className="rag-word-k">{w.k}</span>
              <span className="rag-word-d">{w.d}</span>
              {i < WORDS.length - 1 && <span className="rag-word-dot">·</span>}
            </motion.div>
          ))}
        </div>

        <p className="hero-sub">
          A friendly, visual guide to <strong>Retrieval-Augmented Generation</strong> —
          how AI looks things up before it answers. No prior AI background needed.
        </p>

        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => go('what')}>
            Start learning
          </button>
          <button className="btn btn-ghost" onClick={() => go('playground')}>
            Try the playground
          </button>
        </div>

        <ul className="hero-learn">
          {LEARN.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </motion.div>
    </header>
  )
}
