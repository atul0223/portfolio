/* eslint-disable react/only-export-components -- Shared animation primitives intentionally live with their components. */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF'
export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** Decodes text from random glyphs into the final string. */
export function scramble(el: HTMLElement, to: string, duration = 900) {
  if (reduceMotion()) { el.textContent = to; return () => {} }
  const from = el.textContent ?? ''
  const len = Math.max(from.length, to.length)
  const queue = Array.from({ length: len }, (_, i) => ({
    to: to[i] ?? '',
    start: Math.random() * duration * 0.4,
    end: duration * 0.4 + Math.random() * duration * 0.6,
  }))
  const t0 = performance.now()
  let raf = 0
  const tick = () => {
    const t = performance.now() - t0
    let out = ''
    let done = 0
    for (const q of queue) {
      if (t >= q.end) { out += q.to; done++ }
      else if (t >= q.start) out += q.to === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      else out += from[out.length] ?? ''
    }
    el.textContent = out
    if (done < queue.length) raf = requestAnimationFrame(tick)
  }
  tick()
  return () => cancelAnimationFrame(raf)
}

/** Text that decodes when it scrolls into view, and again on hover. */
export function Decode({ text, as: Tag = 'span', className }: { text: string; as?: 'span' | 'h2' | 'h3' | 'p'; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  useEffect(() => {
    if (inView && ref.current) return scramble(ref.current, text, 1100)
  }, [inView, text])
  return (
    <Tag
      ref={ref as never}
      className={className}
      aria-label={text}
      onPointerEnter={() => ref.current && finePointer() && scramble(ref.current, text, 600)}
    >
      {reduceMotion() ? text : text.replace(/\S/g, ' ')}
    </Tag>
  )
}

/** Cycles through phrases with a decode effect. */
export function Cycler({ items, interval = 2600 }: { items: string[]; interval?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (reduceMotion()) return
    let i = 0
    let stop = () => {}
    const id = window.setInterval(() => {
      i = (i + 1) % items.length
      if (ref.current) stop = scramble(ref.current, items[i], 800)
    }, interval)
    return () => { window.clearInterval(id); stop() }
  }, [items, interval])
  return <span ref={ref}>{items[0]}</span>
}

/** Fades and lifts its children into view. */
export function Reveal({ children, delay = 0, className, y = 40 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={reduceMotion() ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Pulls its child toward the cursor while hovered. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 })
  const [on] = useState(finePointer)
  return (
    <motion.span
      className="magnetic"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (!on || reduceMotion()) return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.span>
  )
}

/** A block cursor that follows the pointer and grows over interactive things. */
export function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40 })
  const sy = useSpring(y, { stiffness: 500, damping: 40 })
  const [state, setState] = useState<'idle' | 'link' | 'view'>('idle')
  const [on] = useState(() => finePointer() && !reduceMotion())
  useEffect(() => {
    if (!on) return
    const move = (e: PointerEvent) => { x.set(e.clientX); y.set(e.clientY) }
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      setState(t.closest('[data-cursor="view"]') ? 'view' : t.closest('a, button, input, summary, [data-cursor="link"]') ? 'link' : 'idle')
    }
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerover', over)
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerover', over) }
  }, [on, x, y])
  if (!on) return null
  return (
    <motion.div className={`cursor is-${state}`} style={{ x: sx, y: sy }} aria-hidden>
      <span>{state === 'view' ? 'open' : ''}</span>
    </motion.div>
  )
}

/** Local time in India, ticking. */
export function Clock() {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => { const id = window.setInterval(() => setT(fmt()), 1000); return () => window.clearInterval(id) }, [])
  return <>{t} IST</>
}
