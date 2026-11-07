import { useEffect, useRef, useState, type FormEvent } from 'react'
import gsap from 'gsap'
import { profile, skills } from '../data'
import { Magnetic, reduceMotion } from './fx'
import { Heading, enter, useGsap } from './motion'

type Line = { kind: 'in' | 'out'; text: string; href?: string }

const HELP = 'commands: whoami, skills, email, github, linkedin, resume, hire, clear'

/** A tiny shell visitors can type into, next to the plain contact links. */
function Shell() {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', text: 'atul.sh interactive shell. Type "help" and press Enter.' },
  ])
  const [value, setValue] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const cancelDemo = useRef(() => {})

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }) }, [lines])

  // types a demo command by itself the first time the shell scrolls into view
  useEffect(() => {
    const el = box.current
    if (!el || reduceMotion()) return
    let timer = 0
    let timeout = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const demo = 'whoami'
      let i = 0
      timer = window.setInterval(() => {
        i++
        setValue(demo.slice(0, i))
        if (i >= demo.length) {
          window.clearInterval(timer)
          timeout = window.setTimeout(() => { setLines((l) => [...l, { kind: 'in', text: demo }, ...run(demo), { kind: 'out', text: 'Your turn. Try "resume" or "hire".' }]); setValue('') }, 450)
        }
      }, 120)
    }, { threshold: 0.6 })
    cancelDemo.current = () => { io.disconnect(); window.clearInterval(timer); window.clearTimeout(timeout) }
    io.observe(el)
    return () => cancelDemo.current()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const run = (raw: string): Line[] => {
    const cmd = raw.trim().toLowerCase()
    switch (cmd) {
      case '': return []
      case 'help': return [{ kind: 'out', text: HELP }]
      case 'whoami': return [{ kind: 'out', text: `${profile.name}: full-stack engineer in ${profile.location}. ${profile.bio}` }]
      case 'skills': return [{ kind: 'out', text: skills.flatMap((group) => group.items).join(', ') }]
      case 'email': return [{ kind: 'out', text: profile.email, href: `mailto:${profile.email}` }]
      case 'github': return [{ kind: 'out', text: profile.github.replace('https://', ''), href: profile.github }]
      case 'linkedin': return [{ kind: 'out', text: profile.linkedin.replace('https://', ''), href: profile.linkedin }]
      case 'resume': return [{ kind: 'out', text: 'Atul_Sharma_Resume.pdf', href: profile.resume }]
      case 'hire':
      case 'sudo hire atul':
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent('Project enquiry')}`
        return [{ kind: 'out', text: 'Opening your mail app...' }]
      default: return [{ kind: 'out', text: `command not found: ${cmd}. ${HELP}` }]
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    cancelDemo.current()
    if (value.trim().toLowerCase() === 'clear') { setLines([]); setValue(''); return }
    const output = run(value)
    setLines((l) => [...l, { kind: 'in', text: value }, ...output])
    setValue('')
  }

  return (
    <div className="shell" onClick={() => box.current?.querySelector('input')?.focus()}>
      <div className="win-bar"><span className="dots"><i /><i /><i /></span><span className="win-path">~/contact</span></div>
      <div className="shell-body" ref={box}>
        {lines.map((l, i) => (
          <p key={i} className={l.kind}>
            {l.kind === 'in' && <span className="prompt">$ </span>}
            {l.href ? <a href={l.href} target="_blank" rel="noopener">{l.text}</a> : l.text}
          </p>
        ))}
        <form onSubmit={submit} className="shell-input">
          <span className="prompt">$</span>
          <input value={value} onChange={(e) => { cancelDemo.current(); setValue(e.target.value) }} aria-label="Type a command" spellCheck={false} autoComplete="off" placeholder="help" />
        </form>
      </div>
    </div>
  )
}

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(profile.email).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1600) }).catch(() => setCopied(false))
  }

  const ref = useGsap<HTMLElement>((root) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 70%' } })
    tl.add(enter(root.querySelectorAll('.sec-note, .contact-mail'), { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }), 0.3)
      .add(enter(root.querySelectorAll('.contact-links .magnetic'), { scale: 0, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(2.2)' }), 0.5)
      .add(enter(root.querySelector('.shell'), { rotateY: -35, rotateX: 10, x: 120, opacity: 0, duration: 1.4, ease: 'expo.out', transformPerspective: 1200 }), 0.2)
  })

  return (
    <section className="contact" id="contact" ref={ref}>
      <div className="wrap contact-grid">
        <div>
          <p className="kicker"><span className="prompt">#</span> contact</p>
          <Heading text="Let's build something." />
          <p className="sec-note">Freelance projects, full-time roles or just a hello. I reply within a day.</p>
          <div className="contact-mail">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <button type="button" className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
          <div className="contact-links">
            <Magnetic><a className="btn btn-amber" href={`mailto:${profile.email}`}>Email me</a></Magnetic>
            <Magnetic><a className="btn btn-ghost" href={profile.github} target="_blank" rel="noopener">GitHub</a></Magnetic>
            <Magnetic><a className="btn btn-ghost" href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</a></Magnetic>
            <Magnetic><a className="btn btn-ghost" href={profile.resume} target="_blank" rel="noopener">Resume</a></Magnetic>
          </div>
        </div>
        <Shell />
      </div>
    </section>
  )
}
