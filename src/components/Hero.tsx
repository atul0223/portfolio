import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { profile } from '../data'
import type { Project } from '../useGithubRepos'
import { Magnetic, Roll } from './ui'

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
  show: (d: number) => ({ y: 0, transition: { delay: 0.15 + d * 0.12, duration: 1, ease: [0.2, 0.7, 0.2, 1] as const } }),
}

/** Fades a chapter in and out over a slice of the hero's scroll progress. */
function useChapter(progress: MotionValue<number>, range: number[], opacity: number[]) {
  const o = useTransform(progress, range, opacity)
  const y = useTransform(progress, range, opacity.map((v, i) => (v === 1 ? 0 : i === 0 ? 60 : -60)))
  const visibility = useTransform(o, (v) => (v < 0.02 ? 'hidden' : 'visible'))
  return { opacity: o, y, visibility }
}

export default function Hero({
  projects,
  onSelect,
  ready,
}: {
  projects: Project[]
  onSelect: (p: Project) => void
  ready: boolean
}) {
  const role = useRotatingWord(profile.roles)
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const intro = useChapter(scrollYProgress, [0, 0.16], [1, 0])
  const layers = useChapter(scrollYProgress, [0.22, 0.32, 0.5, 0.6], [0, 1, 1, 0])
  const planets = useChapter(scrollYProgress, [0.64, 0.74, 1], [0, 1, 1])
  const cue = useChapter(scrollYProgress, [0, 0.06], [1, 0])

  return (
    <section id="top" className="hero" ref={ref}>
      <div className="hero-sticky">
        <Suspense fallback={<div className="scene-fallback" />}>
          <Scene projects={projects} onSelect={onSelect} progress={scrollYProgress} />
        </Suspense>

        <motion.div
          className="hero-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ delay: 1.4 }}
        >
          <span className="pulse" />
          <span className="hint-mouse">Scroll to fly through — each planet is a project, click to explore</span>
          <span className="hint-touch">Scroll to fly through — tap a planet</span>
        </motion.div>

        {/* Chapter 1 — intro */}
        <motion.div className="hero-overlay" style={intro}>
          <motion.div
            className="hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ delay: 0.7 }}
          >
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
                <motion.span variants={rise} initial="hidden" animate={ready ? 'show' : 'hidden'} custom={i} aria-hidden>
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
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <p>{profile.bio}</p>
            <div className="cta">
              <Magnetic>
                <a href="#projects" className="btn primary">
                  <Roll>See the work ↓</Roll>
                </a>
              </Magnetic>
              <Magnetic>
                <a href={profile.github} target="_blank" rel="noreferrer" className="btn">
                  <Roll>GitHub ↗</Roll>
                </a>
              </Magnetic>
              <Magnetic>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn">
                  <Roll>LinkedIn ↗</Roll>
                </a>
              </Magnetic>
              <Magnetic>
                <a href={profile.resume} download className="btn">
                  <Roll>Résumé ↓</Roll>
                </a>
              </Magnetic>
            </div>
          </motion.div>
        </motion.div>

        {/* Chapter 2 — what I build */}
        <motion.div className="hero-chapter right" style={layers}>
          <span className="mono kicker">(Web · Mobile · DevOps)</span>
          <h2>
            One engineer.
            <br />
            <em>Every layer.</em>
          </h2>
          <p>React &amp; Next.js frontends, React Native apps and Node.js APIs — containerised and shipped to the cloud.</p>
        </motion.div>

        {/* Chapter 3 — the planets */}
        <motion.div className="hero-chapter" style={planets}>
          <span className="mono kicker">({String(projects.length).padStart(2, '0')} projects)</span>
          <h2>
            Every planet
            <br />
            is a <em>project.</em>
          </h2>
          <p>
            <span className="hint-mouse">Hover a planet to name it, click to open the full story.</span>
            <span className="hint-touch">Tap a planet to open the full story.</span>
          </p>
        </motion.div>

        <motion.div className="hero-cue mono" style={cue} aria-hidden>
          <span>Scroll</span>
          <i />
        </motion.div>
        <div className="hero-bar" aria-hidden>
          <motion.span style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  )
}
