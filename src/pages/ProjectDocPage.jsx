import { useParams, Link, Navigate } from 'react-router-dom'
import TopNav from '../components/TopNav.jsx'
import Footer from '../components/Footer.jsx'
import MarkdownBlock from '../components/MarkdownBlock.jsx'
import { getProject } from '../data/projects.js'

// Shared layout for a project's long-form sub-pages (build guide, interview questions).
const VIEWS = {
  build: {
    field: 'buildDoc',
    kicker: 'Deep build guide',
    title: (p) => `Build ${p.name}`,
    lead: 'A hands-on, phase-by-phase path with real, copy-pasteable code. Build it one phase at a time — each phase ends with a check.',
  },
  interview: {
    field: 'interviewDoc',
    kicker: 'Interview prep',
    title: (p) => `${p.name} — interview questions`,
    lead: 'A graded question bank for a 3+ year candidate: warm-up fundamentals → core design → advanced failure-modes and system design. Use it as a self-test.',
  },
}

export default function ProjectDocPage({ which }) {
  const { slug } = useParams()
  const project = getProject(slug)
  const view = VIEWS[which]
  if (!project || !view || !project[view.field]) return <Navigate to="/projects" replace />

  return (
    <>
      <TopNav />
      <main className="page">
        <div className="page-inner">
          <Link to={`/projects/${slug}`} className="back-link">← Back to {project.name}</Link>
          <span className="kicker">{view.kicker}</span>
          <h1 className="section-title">
            <span className="proj-title-icon">{project.icon}</span> {view.title(project)}
          </h1>
          <p className="section-lead">{view.lead}</p>
          <MarkdownBlock raw={which === 'interview'}>{project[view.field]}</MarkdownBlock>
        </div>
      </main>
      <Footer />
    </>
  )
}
