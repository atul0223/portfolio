import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useScroll, useSpring } from 'framer-motion'
import Boot from './components/Boot'
import Nav from './components/Nav'
import Journey from './components/Journey'
import Intro from './components/Intro'
import Work from './components/Work'
import Clients from './components/Clients'
import GitLog from './components/GitLog'
import Contact from './components/Contact'
import { Cursor, scramble } from './components/fx'
import { Marquee, enter, useGsap } from './components/motion'
import { profile } from './data'
import { useGithubRepos } from './useGithubRepos'
import { useLenis } from './useLenis'

const COPYRIGHT_YEAR = new Date().getFullYear()

function Footer() {
  const name = profile.name.toUpperCase()
  const ref = useGsap<HTMLElement>((root) => {
    enter(root.querySelectorAll('.fn-char'), {
      yPercent: 110, rotate: 12, stagger: 0.035, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
    })
    enter(root.querySelectorAll('.footer-row > *'), { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root, start: 'top 70%' } })
  })
  return (
    <footer className="footer" ref={ref}>
      <a href="#top" className="footer-name" aria-label="Back to top" onPointerEnter={(e) => {
        e.currentTarget.querySelectorAll<HTMLElement>('.fn-char').forEach((c, i) => window.setTimeout(() => scramble(c, c.dataset.c ?? '', 400), i * 30))
      }}>
        {[...name].map((c, i) => <span className="fn-mask" key={i}><span className="fn-char" data-c={c}>{c === ' ' ? ' ' : c}</span></span>)}
      </a>
      <div className="footer-row">
        <span>© {COPYRIGHT_YEAR} {profile.name}</span>
        <span>Built with React, Three.js, GSAP and a lot of coffee</span>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  )
}

export default function App() {
  const { scrollYProgress } = useScroll()
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  const { projects, live } = useGithubRepos()
  const [ready, setReady] = useState(false)
  const onBoot = useCallback(() => setReady(true), [])
  useLenis()
  // pinned sections measure the page: re-measure once fonts and the loader are done
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    if (ready) window.setTimeout(() => ScrollTrigger.refresh(), 300)
  }, [ready])

  return (
    <>
      <Boot onDone={onBoot} />
      <motion.div className="progress" style={{ scaleX: bar }} />
      <Nav />
      <Journey ready={ready} />
      <main>
        <Marquee rows={[['React', 'React Native', 'Node.js', 'TypeScript', 'MongoDB'], ['Three.js', 'Docker', 'Express', 'Socket.IO', 'AWS']]} />
        <Intro />
        <Work projects={projects} live={live} />
        <Clients />
        <Marquee rows={[['Websites', 'Mobile apps', 'APIs', 'Dashboards'], ['Open to freelance', 'Based in India', 'Remote friendly']]} />
        <GitLog />
        <Contact />
      </main>
      <Footer />
      <div className="scanlines" aria-hidden />
      <Cursor />
    </>
  )
}
