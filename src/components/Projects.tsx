import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import type { Project } from '../useGithubRepos'
import ProjectCover from './ProjectCover'
import SectionTitle from './SectionTitle'
import { Roll } from './ui'

const year = (iso: string) => (iso ? new Date(iso).getFullYear() : '')
const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''

export function ProjectModal({
  project,
  index,
  onClose,
}: {
  project: Project
  index: number
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <button className="close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="modal-cover">
          <ProjectCover project={project} index={index} />
        </div>
        <span className="mono kicker">
          {project.category} {project.featured && '· Featured'}
        </span>
        <h3>{project.title}</h3>
        <p className="modal-lead">{project.tagline}</p>
        {project.highlights.length > 0 && (
          <ul className="highlights">
            {project.highlights.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                {h}
              </motion.li>
            ))}
          </ul>
        )}
        <div className="tags">
          {project.stack.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>
        <div className="cta">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn primary">
              <Roll>Live demo ↗</Roll>
            </a>
          )}
          <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn">
            <Roll>Source code ↗</Roll>
          </a>
        </div>
        <p className="mono dim">
          github/{project.name}
          {project.updatedAt && ` · updated ${formatDate(project.updatedAt)}`}
          {project.stars > 0 && ` · ★ ${project.stars}`}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function Projects({
  projects,
  live,
  onSelect,
}: {
  projects: Project[]
  live: boolean
  onSelect: (p: Project) => void
}) {
  const [filter, setFilter] = useState('All')
  const [hovered, setHovered] = useState<Project | null>(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 180, damping: 22 })
  const sy = useSpring(py, { stiffness: 180, damping: 22 })

  const filters = useMemo(() => {
    const counts = new Map<string, number>()
    projects.forEach((p) => p.stack.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)))
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([t]) => t)
    return ['All', 'Web', 'Mobile', ...top]
  }, [projects])

  const visible = projects.filter(
    (p) => filter === 'All' || p.category === filter || p.stack.includes(filter),
  )

  return (
    <section id="projects" className="section">
      <SectionTitle
        kicker="02"
        title="Selected work"
        sub={`${projects.length} projects ${live ? 'synced live from' : 'from'} github.com/atul0223`}
      />

      <div className="filters">
        {filters.map((f) => (
          <button key={f} className={filter === f ? 'filter active' : 'filter'} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <ul
        className="rows"
        onPointerMove={(e) => {
          px.set(e.clientX)
          py.set(e.clientY)
        }}
        onPointerLeave={() => setHovered(null)}
      >
        <AnimatePresence initial={false}>
          {visible.map((p, i) => (
            <motion.li
              key={p.name}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
            >
              <button
                className="row"
                style={{ '--c': p.color } as CSSProperties}
                onClick={() => onSelect(p)}
                onPointerEnter={() => setHovered(p)}
              >
                <span className="row-num mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="row-main">
                  <span className="row-title">
                    {p.title}
                    {p.liveUrl && <span className="live mono">● live</span>}
                  </span>
                  <span className="row-tagline">{p.tagline}</span>
                </span>
                <span className="row-stack mono">{p.stack.slice(0, 3).join(' / ')}</span>
                <span className="row-year mono">{year(p.updatedAt)}</span>
                <span className="row-arrow">↗</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Cover that trails the cursor while hovering the list (hidden on touch via CSS). */}
      <motion.div className="preview" style={{ x: sx, y: sy }} aria-hidden>
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered.name}
              className="preview-inner"
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectCover project={hovered} index={projects.indexOf(hovered)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
