import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav.jsx'
import Footer from '../components/Footer.jsx'
import { projects } from '../data/projects.js'

export default function ProjectsPage() {
  return (
    <>
      <TopNav />
      <main className="page">
        <div className="page-inner">
          <span className="kicker">Portfolio</span>
          <h1 className="section-title">Projects</h1>
          <p className="section-lead">
            Real-world GenAI systems built on the RAG + agent foundations from the{' '}
            <Link to="/rag">Learn RAG</Link> section. Click a project for its architecture
            and a build guide.
          </p>

          <div className="proj-cards">
            {projects.map((p) => (
              <Link key={p.slug} to={`/projects/${p.slug}`} className="proj-card">
                <span className="proj-icon">{p.icon}</span>
                <h2>{p.name}</h2>
                <p className="proj-tagline">{p.tagline}</p>
                <p className="proj-summary">{p.summary}</p>
                <div className="proj-chips">
                  {p.stack.slice(0, 6).map((s) => (
                    <span key={s} className="chip">{s}</span>
                  ))}
                  {p.stack.length > 6 && <span className="chip">+{p.stack.length - 6}</span>}
                </div>
                <span className="hub-card-cta">View project →</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
