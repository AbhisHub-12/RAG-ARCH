import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TopNav from '../components/TopNav.jsx'
import Footer from '../components/Footer.jsx'

export default function Landing() {
  return (
    <>
      <TopNav />
      <header className="hub-hero">
        <div className="hero-glow" aria-hidden="true" />
        <motion.div
          className="hub-hero-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="hero-badge">RAG-ARCH</span>
          <h1 className="hero-title">
            Learn RAG. <span className="grad">Then build with it.</span>
          </h1>
          <p className="hero-sub">
            A beginner-first guide to <strong>Retrieval-Augmented Generation</strong> — and
            real-world GenAI projects that put it to work. Pick a path:
          </p>
        </motion.div>
      </header>

      <main className="hub">
        <div className="hub-cards">
          <Link to="/rag" className="hub-card hub-card--rag">
            <span className="hub-card-icon">◭</span>
            <h2>Learn RAG</h2>
            <p>
              What RAG is, the full architecture, the theory of <em>why</em> it works, an
              interactive playground, and a searchable glossary — explained from zero.
            </p>
            <span className="hub-card-cta">Start learning →</span>
          </Link>

          <Link to="/projects" className="hub-card hub-card--projects">
            <span className="hub-card-icon">🧩</span>
            <h2>Projects</h2>
            <p>
              Real GenAI systems built on RAG + agents: <strong>NetPulse</strong> (network
              troubleshooting copilot) and <strong>IntentNet</strong> (agentic network
              change). Architecture and how to build them.
            </p>
            <span className="hub-card-cta">Explore projects →</span>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
