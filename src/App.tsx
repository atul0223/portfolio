import { useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Projects, { ProjectModal } from './components/Projects'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Contact from './components/Contact'
import { Cursor, FitText } from './components/ui'
import { useGithubRepos, type Project } from './useGithubRepos'

export default function App() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  const { projects, live } = useGithubRepos()
  const [selected, setSelected] = useState<Project | null>(null)

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progress }} />
      <Nav />
      <Hero projects={projects} onSelect={setSelected} />
      <main>
        <About />
        <Projects projects={projects} live={live} onSelect={setSelected} />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <footer className="footer">
        <a href="#top" className="wordmark" aria-label="Back to top">
          <FitText text="Atul Sharma" />
        </a>
        <div className="footer-row">
          <span>© {new Date().getFullYear()} Atul Sharma</span>
          <span>Built with React, Three.js &amp; Framer Motion</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
      <div className="grain" aria-hidden />
      <Cursor />
      <AnimatePresence>
        {selected && (
          <ProjectModal
            project={selected}
            index={projects.findIndex((p) => p.name === selected.name)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
