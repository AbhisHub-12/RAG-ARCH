import { useMemo, useState } from 'react'
import { glossary } from '../data/glossary.js'

export default function Glossary() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return glossary
    return glossary.filter(
      (g) => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="glossary">
      <div className="glossary-search">
        <span className="glossary-search-icon">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms… e.g. embedding, chunk, vector"
          aria-label="Search glossary"
        />
        <span className="glossary-count">{filtered.length} terms</span>
      </div>

      {filtered.length === 0 ? (
        <p className="glossary-empty">No terms match “{query}”. Try another word.</p>
      ) : (
        <dl className="glossary-list">
          {filtered.map((g) => (
            <div key={g.term} className="glossary-item">
              <dt>{g.term}</dt>
              <dd>{g.def}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
