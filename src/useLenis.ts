import { useEffect } from 'react'
import type Lenis from 'lenis'

/** The active smooth-scroll instance, so modals can pause page scrolling. */
export let lenis: Lenis | null = null

/**
 * Smooth wheel scrolling on mouse/trackpad devices only. Touch devices already scroll natively
 * and smoothly, so they skip the library and its per-frame loop entirely. Loaded as its own chunk.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let cancelled = false
    import('lenis').then(({ default: LenisCtor }) => {
      if (cancelled) return
      lenis = new LenisCtor({ duration: 1.2, autoRaf: true, anchors: { offset: -70 } })
    })
    return () => {
      cancelled = true
      lenis?.destroy()
      lenis = null
    }
  }, [])
}
