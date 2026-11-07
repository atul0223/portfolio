import { useEffect, useState } from 'react'
import { profile } from '../data'
import { Magnetic, scramble } from './fx'

const LINKS = [
  ['work', 'Work'],
  ['clients', 'Clients'],
  ['log', 'Experience'],
  ['contact', 'Contact'],
] as const

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  return (
    <>
      <header className={`nav${solid ? ' is-solid' : ''}`}>
        <a href="#top" className="logo" aria-label="Atul Sharma, home">
          <span className="logo-prompt">~/</span>atul<span className="logo-dot">.</span>sh
        </a>
        <nav className="nav-links" aria-label="Main">
          {LINKS.map(([id, label], i) => (
            <a key={id} href={`#${id}`}>
              <span className="nav-n">0{i + 1}</span>
              <span data-text={label} onPointerEnter={(e) => scramble(e.currentTarget, label, 500)}>{label}</span>
            </a>
          ))}
        </nav>
        <span className="status"><i /> Open to freelance</span>
        <Magnetic>
          <a className="btn btn-amber nav-cta" href={profile.resume} target="_blank" rel="noopener">
            Resume
          </a>
        </Magnetic>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span />
        </button>
      </header>
      <div className="menu" aria-hidden={!open} inert={!open}>
        <nav aria-label="Mobile">
          {LINKS.map(([id, label], i) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              <span>0{i + 1}</span>{label}
            </a>
          ))}
          <a href={profile.resume} target="_blank" rel="noopener" onClick={() => setOpen(false)}>
            <span>05</span>Resume
          </a>
        </nav>
      </div>
    </>
  )
}
