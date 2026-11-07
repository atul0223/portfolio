import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** The active smooth-scroll instance, so modals can pause page scrolling. */
export let lenis: Lenis | null = null

/** Smooth scrolling driven by GSAP's ticker so ScrollTrigger pins and scrubs stay in sync. */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // touch devices already scroll natively and smoothly; ScrollTrigger works with native scroll
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    lenis = new Lenis({ duration: 1.2, autoRaf: false, anchors: { offset: -70 } })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis?.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = null
    }
  }, [])
}
