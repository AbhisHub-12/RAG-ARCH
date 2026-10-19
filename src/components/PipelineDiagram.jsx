import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pipelineStages } from '../data/pipeline.js'

export default function PipelineDiagram() {
  const [active, setActive] = useState(0)
  const stage = pipelineStages[active]
  const next = () => setActive((i) => (i + 1) % pipelineStages.length)
  const prev = () =>
    setActive((i) => (i - 1 + pipelineStages.length) % pipelineStages.length)

  return (
    <div className="pipeline">
      <ol className="pipeline-track" role="tablist" aria-label="RAG pipeline stages">
        {pipelineStages.map((s, i) => (
          <li key={s.id} className="pipeline-node-wrap">
            <button
              role="tab"
              aria-selected={i === active}
              className={`pipeline-node ${i === active ? 'is-active' : ''} ${
                i < active ? 'is-done' : ''
              }`}
              onClick={() => setActive(i)}
            >
              <span className="pipeline-icon">{s.icon}</span>
              <span className="pipeline-label">{s.label}</span>
              <span className="pipeline-num">{i + 1}</span>
            </button>
            {i < pipelineStages.length - 1 && (
              <span className={`pipeline-arrow ${i < active ? 'is-done' : ''}`}>→</span>
            )}
          </li>
        ))}
      </ol>

      <div className="pipeline-detail">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="pipeline-detail-head">
              <span className="pipeline-detail-icon">{stage.icon}</span>
              <div>
                <span className="kicker">Step {active + 1} of {pipelineStages.length}</span>
                <h3>{stage.label}</h3>
              </div>
            </div>
            <p className="pipeline-short">{stage.short}</p>
            <p className="pipeline-long">{stage.detail}</p>
          </motion.div>
        </AnimatePresence>

        <div className="pipeline-controls">
          <button className="btn btn-ghost btn-sm" onClick={prev}>‹ Prev</button>
          <div className="pipeline-dots">
            {pipelineStages.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Go to ${s.label}`}
                className={`dot ${i === active ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={next}>Next ›</button>
        </div>
      </div>
    </div>
  )
}
