import gsap from 'gsap'
import { pillars, profile, stats } from '../data'
import { scramble } from './fx'
import { Heading, enter, useGsap } from './motion'

export default function Intro() {
  const ref = useGsap<HTMLElement>((root) => {
    // statement: each word lights up as you read
    gsap.fromTo(root.querySelectorAll('.intro-text .w'), { opacity: 0.12 }, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: root.querySelector('.intro-text'), start: 'top 80%', end: 'bottom 40%', scrub: true },
    })
    // the hairline above the stats draws across
    enter(root.querySelector('.stats-line'), { scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: root.querySelector('.stats'), start: 'top 85%' } })
    // numbers: rise, then decode/count into their final value
    root.querySelectorAll<HTMLElement>('.stat').forEach((stat, i) => {
      const b = stat.querySelector<HTMLElement>('b')!
      const final = b.dataset.value ?? ''
      enter(stat, {
        y: 90, opacity: 0, duration: 1.2, delay: i * 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: root.querySelector('.stats'), start: 'top 85%' },
        onStart: () => {
          const n = parseInt(final, 10)
          if (!Number.isNaN(n) && n <= 100) {
            const o = { v: 0 }
            gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => { b.textContent = Math.round(o.v) + final.replace(String(n), '') } })
          } else scramble(b, final, 1200)
        },
      })
    })
    // pillar cards flip up in 3D, one after another
    gsap.fromTo(root.querySelectorAll('.pillar'),
      { y: 140, rotateX: -65, opacity: 0, transformOrigin: '50% 100%' },
      {
        y: 0, rotateX: 0, opacity: 1, duration: 1.4, stagger: 0.15, ease: 'expo.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: root.querySelector('.pillars'), start: 'top 85%', once: true },
      })
    // pillar numbers spin like counters
    root.querySelectorAll<HTMLElement>('.pillar h3').forEach((h) => {
      gsap.to({}, { scrollTrigger: { trigger: h, start: 'top 90%', onEnter: () => scramble(h, h.dataset.text ?? '', 900) } })
    })
  })

  return (
    <section className="intro" id="about" ref={ref}>
      <div className="wrap">
        <p className="kicker"><span className="prompt">#</span> about</p>
        <p className="intro-text">
          {profile.summary[0].split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}
        </p>

        <div className="stats">
          <span className="stats-line" aria-hidden />
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <b data-value={s.value}>{s.value}</b>
              <span>{s.label.replace(' — ', ': ')}</span>
            </div>
          ))}
        </div>

        <Heading text="Three things I do well." />
        <div className="pillars">
          {pillars.map((p, i) => (
            <article key={p.title} className="pillar">
              <p className="pillar-n">0{i + 1}</p>
              <h3 data-text={p.title}>{p.title}</h3>
              <p>{p.body.replace(/ — /g, ', ')}</p>
              <span className="pillar-glow" aria-hidden />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
