import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useSpring } from 'framer-motion'

/** Button label that rolls up to a copy of itself on hover (styled by .roll in CSS). */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll" data-text={children}>
      <span>{children}</span>
    </span>
  )
}

/** Single-line text scaled so it exactly fills its parent's content width, at any screen size. */
export function FitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return
    const fit = () => {
      const cs = getComputedStyle(box)
      const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      el.style.fontSize = '100px'
      const width = el.getBoundingClientRect().width
      if (width > 0) el.style.fontSize = `${((100 * avail) / width) * 0.99}px`
    }
    fit()
    document.fonts?.ready.then(fit) // re-measure once the display font has loaded
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [text])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}

/** Counts a number like "10+" or "2026" up from a lower value when it scrolls into view. */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const match = value.match(/^(\d+)(.*)$/)
  const target = match ? Number(match[1]) : 0
  const from = target > 1000 ? target - 26 : 0
  const [n, setN] = useState(from)

  useEffect(() => {
    if (!inView || !match) return
    const controls = animate(from, target, {
      duration: 1.6,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!match) return <strong>{value}</strong>
  return (
    <strong ref={ref}>
      {n}
      {match[2]}
    </strong>
  )
}

/** Trailing ring that follows the pointer and swells over anything clickable (fine pointers only). */
export function Cursor() {
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 420, damping: 32, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 420, damping: 32, mass: 0.6 })

  useEffect(() => {
    if (!enabled) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const t = e.target as Element | null
      // The 3D scene sets body cursor to pointer while hovering a planet.
      setActive(!!t?.closest?.('a, button, [role="button"]') || document.body.style.cursor === 'pointer')
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null
  return (
    <motion.div
      className={active ? 'cursor-ring active' : 'cursor-ring'}
      style={{ x: sx, y: sy }}
      animate={{ scale: active ? 1.9 : 1, opacity: visible ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      aria-hidden
    />
  )
}
