import gsap from 'gsap'
import { education, experience, skills } from '../data'
import { scramble } from './fx'
import { Heading, enter, useGsap } from './motion'

const HASHES = ['a3f9c21', '7b1e0d4', '1f00c0d', '0000001']
const clean = (s: string) => s.replace(/\s—\s/g, ' - ').replace(/ · /g, ', ')

/** Experience as a git log that draws itself, skills as a directory listing that prints out. */
export default function GitLog() {
  const commits = [
    ...experience.map((e) => ({ title: `${e.role} @ ${e.company}`, meta: `${clean(e.period)}, ${clean(e.location)}`, points: e.points, head: e.type === 'Full-time' })),
    { title: `${education.degree.replace(',', '')} @ Neelkanth Institute of Technology`, meta: `${clean(education.period)}, ${education.university}`, points: [], head: false },
    { title: 'Initial commit: hello, world', meta: '', points: [], head: false },
  ]

  const ref = useGsap<HTMLElement>((root) => {
    // the graph line grows with scroll
    gsap.fromTo(root.querySelector('.commits'), { '--line': 0 }, {
      '--line': 1, ease: 'none',
      scrollTrigger: { trigger: root.querySelector('.commits'), start: 'top 75%', end: 'bottom 60%', scrub: true },
    })
    // each commit: node pops, title decodes, bullet points type in
    root.querySelectorAll<HTMLElement>('.commit').forEach((c) => {
      const title = c.querySelector<HTMLElement>('b')!
      const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 82%' } })
      tl.add(enter(c.querySelector('.graph'), { scale: 0, rotate: 180, duration: 0.6, ease: 'back.out(3)' }))
        .add(enter(c.querySelector('.commit-head'), { x: -40, opacity: 0, duration: 0.8, ease: 'expo.out', onStart: () => scramble(title, title.dataset.text ?? '', 900) }), 0.1)
        .add(enter(c.querySelectorAll('.commit-meta, li'), { x: -24, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'expo.out' }), 0.35)
    })
    // ls output prints line by line
    enter(root.querySelector('.ls'), { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: root.querySelector('.ls'), start: 'top 85%' } })
    root.querySelectorAll<HTMLElement>('.ls-group').forEach((g, i) => {
      const dir = g.querySelector<HTMLElement>('.ls-dir')!
      gsap.timeline({ scrollTrigger: { trigger: g, start: 'top 90%' }, delay: i * 0.05 })
        .add(enter(dir, { opacity: 0, duration: 0.2, onStart: () => scramble(dir, dir.dataset.text ?? '', 600) }))
        .add(enter(g.querySelectorAll('li'), { opacity: 0, y: 12, scale: 0.8, duration: 0.5, stagger: 0.035, ease: 'back.out(2)' }), 0.15)
    })
  })

  return (
    <section className="log" id="log" ref={ref}>
      <div className="wrap log-grid">
        <div>
          <p className="kicker"><span className="prompt">#</span> experience</p>
          <Heading text="Where I've shipped." />
          <div className="term">
            <p className="term-cmd"><span className="prompt">$</span> git log --graph --oneline career</p>
            <ol className="commits">
              {commits.map((c, i) => (
                <li key={c.title} className={`commit${i === commits.length - 1 ? ' root' : ''}`}>
                  <span className="graph">*</span>
                  <div>
                    <p className="commit-head">
                      <span className="hash">{HASHES[i] ?? HASHES[3]}</span>
                      {c.head && <span className="ref">(HEAD -&gt; main)</span>}
                      <b data-text={c.title}>{c.title}</b>
                    </p>
                    {c.meta && <p className="commit-meta">{c.meta}</p>}
                    {c.points.length > 0 && <ul>{c.points.slice(0, 4).map((p) => <li key={p}>+ {p}</li>)}</ul>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="ls">
          <p className="term-cmd"><span className="prompt">$</span> ls ~/skills</p>
          {skills.map((g) => {
            const dir = g.group.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-') + '/'
            return (
              <div className="ls-group" key={g.group}>
                <p className="ls-dir" data-text={dir}>{dir}</p>
                <ul>{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
