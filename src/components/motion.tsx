/* eslint-disable react/only-export-components -- Shared animation primitives intentionally live with their components. */
import { useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion, scramble } from './fx'

gsap.registerPlugin(ScrollTrigger)

/** Runs GSAP code scoped to a container and reverts it on unmount (skipped for reduced motion). */
export function useGsap<T extends HTMLElement>(fn: (root: T) => void | (() => void), deps: DependencyList = []): RefObject<T | null> {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    if (!ref.current || reduceMotion()) return
    let cleanup: void | (() => void)
    const ctx = gsap.context(() => { cleanup = fn(ref.current!) }, ref.current)
    return () => { cleanup?.(); ctx.revert() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

const RESTING: Record<string, number | string> = {
  opacity: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, rotate: 0, rotation: 0, rotateX: 0, rotateY: 0,
  scale: 1, scaleX: 1, scaleY: 1, clipPath: 'inset(0% 0% 0% 0%)',
}
const FROM_ONLY = new Set(['transformOrigin', 'transformPerspective'])

/**
 * Entrance animation with an explicit resting end state.
 * Unlike gsap.from(), it can never get stuck halfway when React re-runs effects,
 * because the end values are always the clean "at rest" values, not whatever the element had.
 */
export function enter(target: gsap.TweenTarget, vars: gsap.TweenVars): gsap.core.Tween {
  const from: gsap.TweenVars = {}
  const to: gsap.TweenVars = {}
  for (const [k, v] of Object.entries(vars)) {
    if (k in RESTING) { from[k] = v; to[k] = RESTING[k] }
    else if (FROM_ONLY.has(k)) from[k] = v
    else to[k] = v
  }
  return gsap.fromTo(target, from, to)
}

/** Section heading: words rise out of masks, the last word in amber decodes from glyphs. */
export function Heading({ text, className = 'sec-title' }: { text: string; className?: string }) {
  const words = text.split(' ')
  const ref = useGsap<HTMLHeadingElement>((el) => {
    const inner = el.querySelectorAll('.w > span')
    const last = el.querySelector<HTMLElement>('.w:last-child em')
    enter(inner, {
      yPercent: 115,
      rotate: 4,
      duration: 1.2,
      stagger: 0.06,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onStart: () => { if (last) scramble(last, last.dataset.text ?? '', 1100) },
    })
  })
  return (
    <h2 ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span className="w" key={i} aria-hidden>
          <span>{i === words.length - 1 ? <em data-text={w}>{w}</em> : w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h2>
  )
}

/** Two rows of huge words drifting in opposite directions; scrolling speed pushes and skews them. */
export function Marquee({ rows }: { rows: [string[], string[]] }) {
  const ref = useGsap<HTMLDivElement>((el) => {
    const tracks = [...el.querySelectorAll<HTMLElement>('.mq-track')]
    const xs = [0, -50]
    let boost = 0
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: (s) => { boost = gsap.utils.clamp(-10, 10, s.getVelocity() / 250) } })
    const tick = (_: number, dt: number) => {
      tracks.forEach((t, i) => {
        const dir = i ? 1 : -1
        xs[i] += dir * (0.004 + Math.abs(boost) * 0.012) * dt
        if (xs[i] <= -50) xs[i] += 50
        if (xs[i] >= 0) xs[i] -= 50
        gsap.set(t, { xPercent: xs[i], skewX: -boost * 0.8 })
      })
      boost *= 0.92
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  })
  return (
    <div className="marquee" ref={ref} aria-hidden>
      {rows.map((words, r) => (
        <div className="mq-track" key={r}>
          {[0, 1].map((k) => (
            <span key={k} className="mq-set">
              {words.map((w, i) => (
                <span key={i} className={i % 2 ? 'mq-ghost' : ''}>{w}<i>✦</i></span>
              ))}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
