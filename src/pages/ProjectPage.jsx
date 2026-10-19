import { useParams, Link, Navigate } from 'react-router-dom'
import TopNav from '../components/TopNav.jsx'
import Footer from '../components/Footer.jsx'
import FlowStrip from '../components/FlowStrip.jsx'
import FlowConnections from '../components/FlowConnections.jsx'
import MarkdownBlock from '../components/MarkdownBlock.jsx'
import { getProject } from '../data/projects.js'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)
  if (!project) return <Navigate to="/projects" replace />

  return (
    <>
      <TopNav />
      <main className="page">
        <div className="page-inner">
          <Link to="/projects" className="back-link">← All projects</Link>
          <span className="kicker">Project</span>
          <h1 className="section-title">
            <span className="proj-title-icon">{project.icon}</span> {project.name}
          </h1>
          <p className="section-lead">{project.tagline}</p>

          <div className="proj-chips proj-chips--stack">
            {project.stack.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>

          <FlowStrip
            tone={project.flow.tone}
            title={project.flow.title}
            note={project.flow.note}
            steps={project.flow.steps}
          />

          <FlowConnections edges={project.flowEdges} tone={project.flow.tone} />

          <div className="cta-row">
            {project.buildDoc && (
              <Link to={`/projects/${project.slug}/build`} className="build-cta">
                <span className="build-cta-icon">🧱</span>
                <span className="build-cta-text">
                  <strong>Deep build guide</strong>
                  <span>Phase-by-phase, with real copy-pasteable code — build {project.name} from an empty folder.</span>
                </span>
                <span className="build-cta-arrow">→</span>
              </Link>
            )}
            {project.interviewDoc && (
              <Link to={`/projects/${project.slug}/interview`} className="build-cta build-cta--interview">
                <span className="build-cta-icon">🎤</span>
                <span className="build-cta-text">
                  <strong>Interview questions</strong>
                  <span>Graded easy → advanced for 3+ years — a self-test on {project.name}.</span>
                </span>
                <span className="build-cta-arrow">→</span>
              </Link>
            )}
          </div>

          <MarkdownBlock>{project.doc}</MarkdownBlock>
        </div>
      </main>
      <Footer />
    </>
  )
}
