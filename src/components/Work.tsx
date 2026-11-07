import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projectImages } from '../data'
import type { Project } from '../useGithubRepos'
import { finePointer, reduceMotion, scramble } from './fx'
import { Heading, enter, useGsap } from './motion'

/** Every repo from GitHub as an index: rows wipe in, titles decode on hover and a cover follows the cursor. */
export default function Work({ projects, live }: { projects: Project[]; live: boolean }) {
  const preview = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<Project | null>(null)

  const ref = useGsap<HTMLElement>((root) => {
    root.querySelectorAll<HTMLElement>('.arc-row').forEach((row, i) => {
      enter(row, {
        clipPath: 'inset(0 0 100% 0)', y: 40, duration: 1.1, delay: (i % 4) * 0.06, ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 92%' },
      })
      enter(row.querySelector('.arc-line'), { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: row, start: 'top 92%' } })
    })
  }, [projects.length])

  useEffect(() => { ScrollTrigger.refresh() }, [projects.length])

  useEffect(() => {
    const el = preview.current
    if (!el || !finePointer() || reduceMotion()) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })
    let last = 0
    const move = (e: PointerEvent) => {
      xTo(e.clientX + 30)
      yTo(e.clientY - 120)
      // tilt with horizontal speed, then always settle back upright
      gsap.to(el, { rotate: gsap.utils.clamp(-10, 10, (e.clientX - last) * 0.6), duration: 0.35, overwrite: 'auto', onComplete: () => { gsap.to(el, { rotate: 0, duration: 0.6, ease: 'power3.out' }) } })
      last = e.clientX
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <section className="work" id="work" ref={ref}>
      <div className="wrap">
        <div className="sec-head">
          <p className="kicker"><span className="prompt">#</span> all projects</p>
          <Heading text="Everything I've built." />
          <p className="sec-note">{live ? 'Synced live from GitHub.' : 'From my GitHub.'} Hover a row to preview it.</p>
        </div>
        <ol className="archive" onPointerLeave={() => setHover(null)}>
          {projects.map((p, i) => (
            <li
              key={p.name}
              className="arc-row"
              onPointerEnter={(e) => {
                setHover(p)
                const h = e.currentTarget.querySelector<HTMLElement>('h3')
                if (h && finePointer()) scramble(h, p.title, 600)
              }}
            >
              <span className="arc-line" aria-hidden />
              <span className="arc-n">{String(i + 1).padStart(2, '0')}</span>
              <div className="arc-main">
                <h3>{p.title}</h3>
                <p>{p.tagline}</p>
              </div>
              <p className="arc-stack">{p.stack.slice(0, 4).join(' / ')}</p>
              <div className="arc-links">
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener">Live &#8599;</a>}
                <a href={p.repoUrl} target="_blank" rel="noopener">Code &#8599;</a>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className={`arc-preview${hover ? ' is-on' : ''}`} ref={preview} aria-hidden>
        {hover && (projectImages[hover.name]
          ? <img src={projectImages[hover.name]} alt="" />
          : <div className="arc-card"><span>{hover.category}</span><b>{hover.title}</b><code>{hover.stack.slice(0, 3).join(' · ')}</code></div>)}
      </div>
    </section>
  )
}
