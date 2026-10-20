import { useEffect } from 'react'
import Lenis from 'lenis'

/** The active smooth-scroll instance, so modals can pause page scrolling. */
export let lenis: Lenis | null = null

export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ duration: 1.2, autoRaf: true, anchors: { offset: -70 } })
    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [])
}
