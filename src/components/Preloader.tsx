import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { profile } from '../data'

const YEAR = new Date().getFullYear()

/** Counts to 100 while fonts load, then lifts away like a curtain. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const count = new Promise<void>((resolve) => {
      animate(0, 100, {
        duration: reduced ? 0.2 : 1.6,
        ease: [0.6, 0, 0.3, 1],
        onUpdate: (v) => setN(Math.round(v)),
        onComplete: resolve,
      })
    })
    Promise.all([count, document.fonts?.ready]).then(() => {
      setLeaving(true)
      onDone()
    })
  }, [onDone])

  return (
    <motion.div
      className="preloader"
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      animate={leaving ? { clipPath: 'inset(0 0 100% 0)' } : undefined}
      transition={{ duration: 1, ease: [0.7, 0, 0.2, 1] }}
      aria-hidden
    >
      <div className="preloader-name">
        {profile.name.split(' ').map((w, i) => (
          <span key={w} className="line">
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: leaving ? '-110%' : 0 }}
              transition={{ duration: leaving ? 0.5 : 0.9, delay: leaving ? 0 : 0.1 + i * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {w}
              {i === 1 && <em>.</em>}
            </motion.span>
          </span>
        ))}
      </div>
      <div className="preloader-foot mono">
        <span>Portfolio — {YEAR}</span>
        <span className="preloader-count">{String(n).padStart(3, '0')}</span>
      </div>
      <div className="preloader-bar">
        <span style={{ transform: `scaleX(${n / 100})` }} />
      </div>
    </motion.div>
  )
}
