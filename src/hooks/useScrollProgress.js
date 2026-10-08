import { useEffect, useRef } from 'react'

/**
 * Track how far an element has been scrolled through, as a 0..1 value.
 * Reads scroll inside a rAF loop and reports through a callback ref so the
 * caller can drive a canvas without re-rendering React on every frame.
 */
export function useScrollProgress(ref, onProgress) {
  const cbRef = useRef(onProgress)

  useEffect(() => {
    cbRef.current = onProgress
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let running = true

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const total = Math.max(1, rect.height - vh)
      const p = Math.min(1, Math.max(0, -rect.top / total))
      cbRef.current?.(p, rect)
    }

    const loop = () => {
      if (!running) return
      measure()
      raf = requestAnimationFrame(loop)
    }

    // Only run while the section is anywhere near the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true
          loop()
        } else if (!entry.isIntersecting && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: '20% 0px' },
    )
    io.observe(el)
    loop()

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [ref])
}
