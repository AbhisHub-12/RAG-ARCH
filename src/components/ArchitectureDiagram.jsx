import { useState } from 'react'

// Full RAG architecture: two phases (ingestion + retrieval) with directional arrows
// and the cross-phase connections (shared vector DB, shared embedding model).

const HW_I = 75 // ingestion box half-width
const HW_R = 60 // retrieval box half-width
const CY1 = 120 // ingestion row center-y
const CY2 = 420 // retrieval row center-y
const BOXH = 72

const INGEST = [
  { id: 'doc', cx: 90, label: 'Documents', sub: 'PDFs · web · notes', desc: 'The raw knowledge you want the AI to use. Anything text-based: manuals, wikis, PDFs, web pages, database rows.' },
  { id: 'chunk', cx: 300, label: 'Chunking', sub: 'split into passages', desc: 'Each document is split into small, focused passages (chunks), with metadata like source and page kept for citations.' },
  { id: 'embed_i', cx: 510, label: 'Embedding', sub: 'text → vectors', desc: 'An embedding model converts every chunk into a vector of meaning. The SAME model is used later for the question.' },
  { id: 'vdb', cx: 760, label: 'Vector DB', sub: 'store + index', desc: 'All chunk vectors (plus their text and metadata) are stored and indexed for fast similarity search. This is the shared bridge between the two phases.' },
]

const RETRIEVE = [
  { id: 'query', cx: 70, label: 'User Query', sub: 'the question', desc: 'The question the user asks at runtime.' },
  { id: 'embed_q', cx: 205, label: 'Embed Query', sub: 'question → vector', desc: 'The question is embedded into a vector using the same embedding model as ingestion, so it can be compared to the stored chunks.' },
  { id: 'search', cx: 340, label: 'Vector Search', sub: 'find similar', desc: 'The query vector is compared against the vectors in the Vector DB to find the closest (most relevant) chunks.' },
  { id: 'topk', cx: 475, label: 'Top-K', sub: 'best chunks', desc: 'The K most similar chunks are kept (e.g. top 3–5). Optionally re-ranked so the best land first.' },
  { id: 'augment', cx: 610, label: 'Augment', sub: 'build prompt', desc: 'The retrieved chunks are combined with the question and an instruction ("answer using only this context") to form the final prompt.' },
  { id: 'llm', cx: 745, label: 'LLM', sub: 'generate', desc: 'The large language model reads the augmented prompt and writes an answer grounded in the retrieved context.' },
  { id: 'answer', cx: 895, label: 'Answer', sub: '+ citations', desc: 'The grounded answer is returned to the user, ideally with citations pointing back to the source chunks.' },
]

const DEFAULT_CAPTION =
  'Tip: click any box to see what it does and how it connects. Ingestion (top) runs once, ahead of time; retrieval + generation (bottom) runs every time a user asks a question.'

export default function ArchitectureDiagram() {
  const [active, setActive] = useState(null)
  const all = [...INGEST, ...RETRIEVE]
  const activeNode = all.find((n) => n.id === active)

  const Box = ({ n, hw, cy, variant }) => {
    const on = active === n.id
    return (
      <g
        className="arch-node"
        onClick={() => setActive(on ? null : n.id)}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={n.cx - hw}
          y={cy - BOXH / 2}
          width={hw * 2}
          height={BOXH}
          rx="12"
          className={`arch-box arch-box--${variant} ${on ? 'is-active' : ''}`}
        />
        <text x={n.cx} y={cy - 6} textAnchor="middle" className="arch-label">
          {n.label}
        </text>
        <text x={n.cx} y={cy + 15} textAnchor="middle" className="arch-sub">
          {n.sub}
        </text>
      </g>
    )
  }

  // horizontal arrow between two same-row boxes
  const rowArrow = (a, b, hw, cy, key) => (
    <line
      key={key}
      x1={a.cx + hw}
      y1={cy}
      x2={b.cx - hw}
      y2={cy}
      className="arch-arrow"
      markerEnd="url(#arrowHead)"
    />
  )

  return (
    <div className="arch">
      <div className="arch-scroll">
        <svg viewBox="0 0 1000 540" className="arch-diagram" role="img"
          aria-label="RAG architecture diagram: ingestion phase (documents, chunking, embedding, vector database) and retrieval phase (user query, embed query, vector search, top-K, augment, LLM, answer), connected by the shared vector database and embedding model.">
          <defs>
            <marker id="arrowHead" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" className="arch-arrowhead" />
            </marker>
            <marker id="arrowTeal" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" className="arch-arrowhead-teal" />
            </marker>
            <marker id="arrowPurple" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" className="arch-arrowhead-purple" />
            </marker>
            <marker id="arrowPurpleStart" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto-start-reverse">
              <path d="M0,0 L6,3 L0,6 Z" className="arch-arrowhead-purple" />
            </marker>
          </defs>

          {/* phase bands */}
          <rect x="4" y="60" width="992" height="116" rx="14" className="arch-band arch-band--ingest" />
          <rect x="4" y="360" width="992" height="116" rx="14" className="arch-band arch-band--retrieve" />
          <text x="20" y="50" className="arch-phase">PHASE 1 · INGESTION — offline: prepare the knowledge (run once, ahead of time)</text>
          <text x="20" y="352" className="arch-phase">PHASE 2 · RETRIEVAL + GENERATION — online: answer a question (runs every query)</text>

          {/* ingestion row arrows */}
          {INGEST.slice(0, -1).map((a, i) => rowArrow(a, INGEST[i + 1], HW_I, CY1, `i${i}`))}
          {/* "store" label on embedding -> vector DB arrow */}
          <text x="635" y="108" textAnchor="middle" className="arch-edge-label">store ▸</text>

          {/* retrieval row arrows */}
          {RETRIEVE.slice(0, -1).map((a, i) => rowArrow(a, RETRIEVE[i + 1], HW_R, CY2, `r${i}`))}

          {/* cross-phase: Vector DB -> Vector Search (reads stored vectors) */}
          <path
            d={`M760,${CY1 + BOXH / 2} L760,300 L340,300 L340,${CY2 - BOXH / 2}`}
            className="arch-conn arch-conn--read"
            markerEnd="url(#arrowTeal)"
          />
          <text x="552" y="292" textAnchor="middle" className="arch-edge-label arch-edge-label--teal">
            ◂ reads the stored vectors (similarity search)
          </text>

          {/* cross-phase: shared embedding model (both embed steps use the same model) */}
          <path
            d={`M510,${CY1 + BOXH / 2} C 470,250 300,270 205,${CY2 - BOXH / 2}`}
            className="arch-conn arch-conn--shared"
            markerEnd="url(#arrowPurple)"
            markerStart="url(#arrowPurpleStart)"
            fill="none"
          />
          <text x="300" y="232" textAnchor="middle" className="arch-edge-label arch-edge-label--purple">
            same embedding model
          </text>

          {/* nodes (drawn last so they sit above connectors) */}
          {INGEST.map((n) => (
            <Box key={n.id} n={n} hw={HW_I} cy={CY1} variant={n.id === 'vdb' ? 'store' : 'ingest'} />
          ))}
          {RETRIEVE.map((n) => (
            <Box key={n.id} n={n} hw={HW_R} cy={CY2} variant={n.id === 'answer' ? 'answer' : 'retrieve'} />
          ))}
        </svg>
      </div>

      <div className={`arch-caption ${activeNode ? 'is-active' : ''}`}>
        {activeNode ? (
          <>
            <strong>{activeNode.label}</strong> {activeNode.desc}
          </>
        ) : (
          DEFAULT_CAPTION
        )}
      </div>

      <ul className="arch-legend">
        <li><span className="dot dot--ingest" /> Ingestion step</li>
        <li><span className="dot dot--store" /> Vector database (shared)</li>
        <li><span className="dot dot--retrieve" /> Retrieval / generation step</li>
        <li><span className="line line--teal" /> reads stored vectors</li>
        <li><span className="line line--purple" /> same embedding model</li>
      </ul>
    </div>
  )
}
