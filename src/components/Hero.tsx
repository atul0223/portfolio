import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data'
import type { Project } from '../useGithubRepos'
import { Roll } from './ui'

// three.js is heavy — load it after first paint.
const Scene = lazy(() => import('./Scene'))

function useRotatingWord(words: string[], ms = 2600) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % words.length), ms)
    return () => clearInterval(t)
  }, [words, ms])
  return words[i]
}

const rise = {
  hidden: { y: '110%' },
  show: (d: number) => ({ y: 0, transition: { delay: 0.2 + d * 0.12, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] as const } }),
}

export default function Hero({ projects, onSelect }: { projects: Project[]; onSelect: (p: Project) => void }) {
  const role = useRotatingWord(profile.roles)

  return (
    <section id="top" className="hero">
      <Suspense fallback={<div className="scene-fallback" />}>
        <Scene projects={projects} onSelect={onSelect} />
      </Suspense>

      <motion.div
        className="hero-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <span className="pulse" />
        <span className="hint-mouse">Each planet is a project — drag to orbit, click to explore</span>
        <span className="hint-touch">Each planet is a project — tap one</span>
      </motion.div>

      <div className="hero-overlay">
        <motion.div className="hero-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <span>{profile.location}</span>
          <span className="role-swap">
            <motion.span key={role} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {role}
            </motion.span>
          </span>
        </motion.div>

        <h1 className="hero-name" aria-label={profile.name}>
          {profile.name.split(' ').map((w, i) => (
            <span className="line" key={w}>
              <motion.span variants={rise} initial="hidden" animate="show" custom={i} aria-hidden>
                {[...w].map((ch, ci) => (
                  <span className="char" key={ci}>
                    {ch}
                  </span>
                ))}
                {i === 1 && <em className="char">.</em>}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <p>{profile.bio}</p>
          <div className="cta">
            <a href="#projects" className="btn primary">
              <Roll>See the work ↓</Roll>
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="btn">
              <Roll>GitHub ↗</Roll>
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn">
              <Roll>LinkedIn ↗</Roll>
            </a>
            <a href={profile.resume} download className="btn">
              <Roll>Résumé ↓</Roll>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
