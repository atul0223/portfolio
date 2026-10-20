import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** Button label that rolls up to a copy of itself on hover (styled by .roll in CSS). */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll" data-text={children}>
      <span>{children}</span>
    </span>
  )
}

/** Pulls its child toward the cursor while hovered, then springs back (fine pointers only). */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 })
  const [enabled] = useState(finePointer)

  return (
    <motion.span
      className="magnetic"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (!enabled) return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

/** Tilts its content in 3D toward the cursor with a moving glare highlight. */
export function Tilt({ children, max = 10, className }: { children: ReactNode; max?: number; className?: string }) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 160, damping: 18 })
  const sy = useSpring(py, { stiffness: 160, damping: 18 })
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const glare = useTransform([sx, sy], ([gx, gy]: number[]) =>
    `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgba(255,255,255,0.18), transparent 55%)`,
  )
  const [enabled] = useState(finePointer)

  return (
    <motion.div
      className={className ? `tilt ${className}` : 'tilt'}
      style={enabled ? { rotateX, rotateY, transformPerspective: 1100 } : undefined}
      onPointerMove={(e) => {
        if (!enabled) return
        const r = e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width)
        py.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
      }}
    >
      {children}
      {enabled && <motion.span className="tilt-glare" style={{ background: glare }} aria-hidden />}
    </motion.div>
  )
}

/** Words laid out on a slowly turning 3D sphere; the cursor steers the spin. */
export function TagSphere({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = ref.current
    if (!box) return
    const els = [...box.querySelectorAll<HTMLElement>('.sphere-tag')]
    const n = els.length
    // Even spread over the sphere (Fibonacci lattice).
    const pts = els.map((_, i) => {
      const y = 1 - (i / Math.max(1, n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = i * Math.PI * (3 - Math.sqrt(5))
      return [Math.cos(th) * r, y, Math.sin(th) * r]
    })
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let vx = 0.0015
    let vy = 0.003
    let rx = 0.3
    let ry = 0
    let raf = 0
    let running = false

    const draw = () => {
      rx += vx
      ry += vy
      const R = box.clientWidth * 0.4
      const cx = Math.cos(rx)
      const sx = Math.sin(rx)
      const cy = Math.cos(ry)
      const sy = Math.sin(ry)
      pts.forEach(([x, y, z], i) => {
        const x1 = x * cy + z * sy
        const z1 = -x * sy + z * cy
        const y2 = y * cx - z1 * sx
        const z2 = y * sx + z1 * cx
        const el = els[i]
        el.style.transform = `translate(-50%, -50%) translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${0.62 + (z2 + 1) * 0.28})`
        el.style.opacity = String(0.22 + ((z2 + 1) / 2) * 0.78)
        el.style.zIndex = String(Math.round(z2 * 100) + 100)
        el.classList.toggle('front', z2 > 0.55)
      })
      if (running && !reduced) raf = requestAnimationFrame(draw)
    }

    const move = (e: PointerEvent) => {
      const b = box.getBoundingClientRect()
      vy = ((e.clientX - b.left) / b.width - 0.5) * 0.014
      vx = -((e.clientY - b.top) / b.height - 0.5) * 0.014
    }
    const obs = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (running) draw()
    })
    obs.observe(box)
    box.addEventListener('pointermove', move)
    draw()
    return () => {
      obs.disconnect()
      cancelAnimationFrame(raf)
      box.removeEventListener('pointermove', move)
    }
  }, [items])

  return (
    <div className="sphere" ref={ref} aria-hidden>
      {items.map((s) => (
        <span className="sphere-tag" key={s}>
          {s}
        </span>
      ))}
    </div>
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
  const [enabled] = useState(finePointer)
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
    <>
      <motion.div
        className={active ? 'cursor-ring active' : 'cursor-ring'}
        style={{ x: sx, y: sy }}
        animate={{ scale: active ? 1.9 : 1, opacity: visible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        aria-hidden
      />
      <motion.div className="cursor-dot" style={{ x, y }} animate={{ opacity: visible && !active ? 1 : 0 }} aria-hidden />
    </>
  )
}
