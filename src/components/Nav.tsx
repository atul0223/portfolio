import { useEffect, useState } from 'react'

const links = ['about', 'projects', 'work', 'skills', 'experience', 'contact']

export default function Nav() {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the section currently in view.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    links.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <header className={scrolled ? 'nav scrolled' : 'nav'}>
      <a href="#top" className="logo">
        AS<span>●</span>
      </a>
      <nav className={open ? 'links open' : 'links'}>
        {links.map((id, i) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className={active === id ? 'active' : ''}>
            <sup>0{i + 1}</sup>
            {id}
          </a>
        ))}
      </nav>
      <button className="menu-btn" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
        {open ? 'Close' : 'Menu'}
      </button>
    </header>
  )
}
