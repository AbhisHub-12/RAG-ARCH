import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { corpus, sampleQuestions } from '../data/corpus.js'

const STOPWORDS = new Set([
  'i', 'a', 'an', 'the', 'is', 'are', 'am', 'do', 'does', 'did', 'how', 'to', 'my',
  'me', 'you', 'your', 'on', 'in', 'of', 'for', 'and', 'or', 'can', 'cant', 'cannot',
  'get', 'got', 'new', 'when', 'what', 'where', 'why', 'it', 'this', 'that', 'with',
  'please', 'help', 'need', 'want', 'would', 'should', 'could', 'will', 'be', 'at',
])

const tokenize = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

const contentTokens = (s) => [...new Set(tokenize(s).filter((t) => !STOPWORDS.has(t)))]

// A deterministic, fake "embedding" just for visualization (not a real model).
function fakeVector(text, n = 8) {
  const toks = tokenize(text)
  const v = new Array(n).fill(0)
  toks.forEach((t, i) => {
    let h = 0
    for (let c = 0; c < t.length; c++) h = (h * 31 + t.charCodeAt(c)) % 1000
    v[(i + h) % n] += ((h % 200) - 100) / 100
  })
  return v.map((x) => Math.max(-1, Math.min(1, x / Math.max(1, toks.length / 2))))
}

function matchScore(queryToks, doc) {
  const bag = new Set([...doc.keywords, ...tokenize(doc.text)])
  const hits = []
  queryToks.forEach((qt) => {
    for (const w of bag) {
      if (w === qt || (qt.length >= 4 && w.includes(qt)) || (w.length >= 4 && qt.includes(w))) {
        hits.push(qt)
        break
      }
    }
  })
  return { score: hits.length, hits }
}

function runRag(query, k) {
  const qToks = contentTokens(query)
  const scored = corpus
    .map((doc) => ({ doc, ...matchScore(qToks, doc) }))
    .sort((a, b) => b.score - a.score)
  const maxScore = scored[0]?.score ?? 0
  const topK = scored.filter((s) => s.score > 0).slice(0, k)
  const found = maxScore > 0
  const prompt = `Answer using ONLY the context. Cite the source. Say "I don't know" if the answer isn't there.

CONTEXT:
${topK.map((s, i) => `[${i + 1}] (${s.doc.source}) ${s.doc.text}`).join('\n') || '(no relevant context found)'}

QUESTION: ${query}`
  const answer = found
    ? `${topK[0].doc.text} ${topK.length > 1 ? '' : ''}`.trim() +
      `  —  (source: ${topK[0].doc.source})`
    : "I couldn't find anything about that in the knowledge base, so the honest answer is: I don't know."
  return { query, vector: fakeVector(query), scored, topK, prompt, answer, found, k }
}

const STEP_LABELS = ['Query', 'Embed', 'Retrieve', 'Augment', 'Generate']

export default function RagPlayground() {
  const [q, setQ] = useState('')
  const [k, setK] = useState(2)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!result) return
    setStep(1)
    const timers = [2, 3, 4, 5].map((s, i) =>
      setTimeout(() => setStep(s), (i + 1) * 650),
    )
    return () => timers.forEach(clearTimeout)
  }, [result])

  const submit = (e) => {
    e?.preventDefault()
    const query = q.trim()
    if (!query) return
    setResult(runRag(query, k))
  }

  const tryQ = (sample) => {
    setQ(sample)
    setResult(runRag(sample, k))
  }

  return (
    <div className="playground">
      <form className="pg-input" onSubmit={submit}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask the help-desk… e.g. how do I reset my password?"
          aria-label="Your question"
        />
        <button className="btn btn-primary" type="submit">Run RAG ▶</button>
      </form>

      <div className="pg-samples">
        <span className="pg-samples-label">Try:</span>
        {sampleQuestions.map((s) => (
          <button key={s} className="chip" onClick={() => tryQ(s)}>{s}</button>
        ))}
      </div>

      <div className="pg-knobs">
        <label>
          Top-K (chunks to retrieve): <strong>{k}</strong>
          <input
            type="range"
            min="1"
            max="3"
            value={k}
            onChange={(e) => {
              const nk = Number(e.target.value)
              setK(nk)
              if (result) setResult(runRag(result.query, nk))
            }}
          />
        </label>
      </div>

      <div className="pg-corpus">
        <span className="pg-corpus-label">Knowledge base ({corpus.length} notes):</span>
        <div className="pg-corpus-list">
          {corpus.map((d) => {
            const picked = result?.topK.some((t) => t.doc.id === d.id)
            return (
              <div key={d.id} className={`pg-doc ${picked ? 'is-picked' : ''}`}>
                <strong>{d.source}</strong>
                <span>{d.text}</span>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            className="pg-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pg-steps">
              {STEP_LABELS.map((label, i) => (
                <span key={label} className={`pg-step ${step > i ? 'is-on' : ''}`}>
                  {i + 1}. {label}
                </span>
              ))}
            </div>

            {step >= 1 && (
              <Stage title="1 · Query" sub="Your raw question">
                <code className="pg-code">{result.query}</code>
              </Stage>
            )}

            {step >= 2 && (
              <Stage title="2 · Embed" sub="Question → vector of meaning (simulated)">
                <div className="pg-vector">
                  [{result.vector.map((n) => n.toFixed(2)).join(', ')} …]
                </div>
              </Stage>
            )}

            {step >= 3 && (
              <Stage title="3 · Retrieve" sub={`Similarity to each note, keeping top-${result.k}`}>
                <div className="pg-scores">
                  {result.scored.map((s) => {
                    const max = result.scored[0].score || 1
                    const pct = Math.round((s.score / max) * 100)
                    const picked = result.topK.some((t) => t.doc.id === s.doc.id)
                    return (
                      <div key={s.doc.id} className={`pg-score ${picked ? 'is-picked' : ''}`}>
                        <span className="pg-score-name">{s.doc.source}</span>
                        <span className="pg-bar">
                          <span className="pg-bar-fill" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="pg-score-val">{s.score ? `${s.score} match` : 'no match'}</span>
                      </div>
                    )
                  })}
                </div>
              </Stage>
            )}

            {step >= 4 && (
              <Stage title="4 · Augment" sub="Build the prompt: instructions + context + question">
                <pre className="pg-prompt">{result.prompt}</pre>
              </Stage>
            )}

            {step >= 5 && (
              <Stage title="5 · Generate" sub="The grounded answer (simulated — no LLM call)">
                <div className={`pg-answer ${result.found ? '' : 'is-unknown'}`}>
                  {result.answer}
                </div>
              </Stage>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stage({ title, sub, children }) {
  return (
    <motion.div
      className="pg-stage"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pg-stage-head">
        <span className="pg-stage-title">{title}</span>
        <span className="pg-stage-sub">{sub}</span>
      </div>
      {children}
    </motion.div>
  )
}
