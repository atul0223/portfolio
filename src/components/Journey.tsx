import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll, useReducedMotion } from 'framer-motion'
import { GITHUB_USER, liveWork, profile, projectMeta } from '../data'
type JourneyApi = ReturnType<typeof import('./journeyScene').createJourney>
import { Cycler, Magnetic, scramble } from './fx'

type Chapter = {
  kicker: string
  title: string
  text: string
  stack?: string[]
  links?: { label: string; href: string; primary?: boolean }[]
  role?: string
}

const repo = (name: string) => `https://github.com/${GITHUB_USER}/${name}`
const fromMeta = (name: string, kicker: string): Chapter => {
  const m = projectMeta[name]
  return {
    kicker,
    title: m.title,
    text: m.tagline,
    stack: m.stack.slice(0, 6),
    links: [
      ...(m.liveUrl ? [{ label: 'Live demo', href: m.liveUrl, primary: true }] : []),
      { label: 'Source', href: repo(name) },
    ],
  }
}

const CHAPTERS: Chapter[] = [
  { kicker: '$ whoami', title: profile.name, text: profile.bio },
  fromMeta('LMS_mobile_application', '01 / mobile app'),
  fromMeta('Social-media-platform-V2', '02 / real-time web app'),
  fromMeta('library-management-system', '03 / full-stack web app'),
  {
    kicker: '04 / live product',
    title: liveWork.name,
    text: liveWork.about,
    role: liveWork.role,
    stack: ['Redesign', 'Web animation', 'Sports tech'],
    links: [{ label: 'Visit amaplayer.com', href: liveWork.url, primary: true }],
  },
  fromMeta('note-taking-application', '05 / full-stack web app'),
]

function Title({ text, active, big }: { text: string; active: boolean; big?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (active && ref.current) return scramble(ref.current, text, 1000)
  }, [active, text])
  return <h2 ref={ref} className={big ? 'ch-title ch-big' : 'ch-title'} aria-label={text}>{text}</h2>
}

/** Scroll-driven flight through one 3D object per project. */
export default function Journey({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const api = useRef<JourneyApi | null>(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    api.current?.setProgress(v)
    setActive(Math.min(CHAPTERS.length - 1, Math.round(v * (CHAPTERS.length - 1))))
  })

  useEffect(() => {
    if (reduced) return
    const c = canvas.current!
    let alive = true
    let cleanup = () => {}
    // three.js + post-processing load as a separate chunk so the page shell paints first
    import('./journeyScene').then(({ createJourney }) => {
      if (!alive) return
      let j: JourneyApi
      try { j = createJourney(c) } catch { c.classList.add('no-webgl'); return }
      api.current = j
      j.setProgress(scrollYProgress.get())
      let visible = true
      let raf = 0
      const loop = () => { raf = requestAnimationFrame(loop); if (visible) j.render() }
      loop()
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; c.style.visibility = visible ? 'visible' : 'hidden' })
      io.observe(section.current!)
      const ro = new ResizeObserver(() => j.resize())
      ro.observe(c)
      cleanup = () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); j.dispose(); api.current = null }
    }).catch(() => { if (alive) c.classList.add('no-webgl') })
    return () => { alive = false; cleanup() }
  }, [scrollYProgress, reduced])

  return (
    <section className={`journey${reduced ? ' journey-static' : ''}`} id="top" ref={section} style={{ height: `${CHAPTERS.length * 100}vh` }}>
      <canvas ref={canvas} className="journey-canvas" aria-hidden />
      <div className="journey-stage">
        {CHAPTERS.map((c, i) => (
          <article key={c.title} className={`chapter${i === active ? ' is-on' : ''}${i === 0 ? ' ch-intro' : ''}`} aria-hidden={!reduced && i !== active} inert={!reduced && i !== active}>
            <p className="ch-kicker">{c.kicker}</p>
            <Title text={i === 0 ? c.title.toUpperCase() : c.title} active={i === active && ready} big={i === 0} />
            {i === 0 && (
              <p className="ch-role"><span className="prompt">&gt;</span> <Cycler items={profile.roles} /></p>
            )}
            {c.role && <p className="ch-own">{c.role}</p>}
            <p className="ch-text">{c.text}</p>
            {c.stack && <ul className="chips">{c.stack.map((s) => <li key={s}>{s}</li>)}</ul>}
            {i === 0 ? (
              <div className="ch-links">
                <Magnetic><a className="btn btn-amber" href="#work">All projects</a></Magnetic>
                <Magnetic><a className="btn btn-ghost" href="#contact">Get in touch</a></Magnetic>
              </div>
            ) : (
              c.links && (
                <div className="ch-links">
                  {c.links.map((l) => (
                    <Magnetic key={l.href}>
                      <a className={`btn ${l.primary ? 'btn-amber' : 'btn-ghost'}`} href={l.href} target="_blank" rel="noopener" tabIndex={reduced || i === active ? 0 : -1}>
                        {l.label} &#8599;
                      </a>
                    </Magnetic>
                  ))}
                </div>
              )
            )}
          </article>
        ))}
        <div className="journey-ui" aria-hidden>
          <span>{String(active + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}</span>
          <div className="journey-bar"><i style={{ transform: `scaleX(${(active + 1) / CHAPTERS.length})` }} /></div>
          <span className="journey-hint">{active === 0 ? 'Scroll to fly through my work' : 'Keep scrolling'}</span>
        </div>
      </div>
    </section>
  )
}
