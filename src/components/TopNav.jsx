import { Link, NavLink } from 'react-router-dom'

// Top bar for the hub, projects, and project-detail pages (router-aware).
export default function TopNav() {
  return (
    <nav className="navbar is-scrolled">
      <Link className="brand" to="/">
        <span className="brand-mark">◭</span>
        <span className="brand-text">RAG-<strong>ARCH</strong></span>
      </Link>
      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/rag">Learn RAG</NavLink>
        <NavLink to="/projects">Projects</NavLink>
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
