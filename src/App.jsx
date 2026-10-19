import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import RagPage from './pages/RagPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import ProjectDocPage from './pages/ProjectDocPage.jsx'

// Reset scroll on every route change (otherwise navigating keeps the old scroll position).
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/rag" element={<RagPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/projects/:slug/build" element={<ProjectDocPage which="build" />} />
        <Route path="/projects/:slug/interview" element={<ProjectDocPage which="interview" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
