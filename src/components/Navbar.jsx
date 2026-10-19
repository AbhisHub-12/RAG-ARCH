import { useEffect, useState } from 'react'

const LINKS = [
  { id: 'what', label: 'What' },
  { id: 'why', label: 'Why' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'playground', label: 'Playground' },
  { id: 'beyond', label: 'Beyond' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'quiz', label: 'Quiz' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="brand" href="#top" onClick={(e) => go(e, 'top')}>
        <span className="brand-mark">◭</span>
        <span className="brand-text">RAG-<strong>ARCH</strong></span>
      </a>

      <button
        className="nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>

      <div className={`nav-links ${open ? 'is-open' : ''}`}>
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)}>
            {l.label}
          </a>
        ))}
        <a
          className="nav-gh"
          href="https://github.com/AbhisHub-12/RAG-ARCH"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  )
}
