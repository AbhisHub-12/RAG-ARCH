import { useParams, Link, Navigate } from 'react-router-dom'
import TopNav from '../components/TopNav.jsx'
import Footer from '../components/Footer.jsx'
import MarkdownBlock from '../components/MarkdownBlock.jsx'
import { getProject } from '../data/projects.js'

export default function BuildGuidePage() {
  const { slug } = useParams()
  const project = getProject(slug)
  if (!project || !project.buildDoc) return <Navigate to="/projects" replace />

  return (
    <>
      <TopNav />
      <main className="page">
        <div className="page-inner">
          <Link to={`/projects/${slug}`} className="back-link">← Back to {project.name}</Link>
          <span className="kicker">Deep build guide</span>
          <h1 className="section-title">
            <span className="proj-title-icon">{project.icon}</span> Build {project.name}
          </h1>
          <p className="section-lead">
            A hands-on, phase-by-phase path with real, copy-pasteable code. Build it one
            phase at a time — each phase ends with a check.
          </p>
          <MarkdownBlock>{project.buildDoc}</MarkdownBlock>
        </div>
      </main>
      <Footer />
    </>
  )
}
