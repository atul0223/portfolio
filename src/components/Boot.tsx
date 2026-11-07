import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { reduceMotion } from './fx'

const LINES = [
  '> booting atul.sh',
  '> loading react, react-native, node',
  '> connecting mongodb ........ ok',
  '> compiling portfolio ....... ok',
  '> building 3d scene',
  '> ready',
]

/** Terminal boot sequence shown while fonts and the portrait load. */
export default function Boot({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0)
  const [gone, setGone] = useState(reduceMotion)

  useEffect(() => {
    if (reduceMotion()) { onDone(); return }
    document.body.style.overflow = 'hidden'
    let timeout = 0
    let i = 0
    const id = window.setInterval(() => {
      i++
      setN(i)
      if (i >= LINES.length) {
        window.clearInterval(id)
        timeout = window.setTimeout(() => {
          setGone(true)
          document.body.style.overflow = ''
          onDone()
        }, 380)
      }
    }, 230)
    return () => { window.clearInterval(id); window.clearTimeout(timeout); document.body.style.overflow = '' }
  }, [onDone])

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="boot"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="boot-lines">
            {LINES.slice(0, n).map((l, i) => (
              <p key={l} className={i === LINES.length - 1 ? 'is-last' : ''}>{l}</p>
            ))}
            <span className="caret" />
          </div>
          <p className="boot-pct">{Math.round((n / LINES.length) * 100)}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
