import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { profile } from '../data'

const YEAR = new Date().getFullYear()
const SEEN_KEY = 'preloader-seen'

function seenThisSession() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

/** Counts to 100 while fonts load, then lifts away like a curtain. Skipped on repeat visits in a session. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [skip] = useState(seenThisSession)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  // Counter is driven by a motion value, so it updates the DOM without re-rendering React each frame.
  const n = useMotionValue(0)
  const label = useTransform(n, (v) => String(Math.round(v)).padStart(3, '0'))
  const bar = useTransform(n, (v) => `scaleX(${v / 100})`)

  useEffect(() => {
    if (skip) {
      onDone()
      return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const count = new Promise<void>((resolve) => {
      animate(n, 100, { duration: reduced ? 0.2 : 0.9, ease: [0.6, 0, 0.3, 1], onComplete: resolve })
    })
    // Never hold the page hostage to a slow font download.
    const fonts = Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1200))])
    Promise.all([count, fonts]).then(() => {
      setLeaving(true)
      onDone()
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* storage unavailable */
      }
    })
  }, [onDone, skip, n])

  if (skip || gone) return null

  return (
    <motion.div
      className="preloader"
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      animate={leaving ? { clipPath: 'inset(0 0 100% 0)' } : undefined}
      onAnimationComplete={() => leaving && setGone(true)}
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
        <motion.span className="preloader-count">{label}</motion.span>
      </div>
      <div className="preloader-bar">
        <motion.span style={{ transform: bar }} />
      </div>
    </motion.div>
  )
}
