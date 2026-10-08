import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './CRTOverlay.module.css'

/**
 * The CRT treatment, done with composited layers instead of a full-screen
 * post-processing pass:
 *   - scanlines + aperture grille (repeating gradients)
 *   - tube vignette and edge curvature shadow
 *   - an animated raster sweep
 *   - a low-frequency noise canvas
 *   - a subtle flicker on the whole stack
 * Everything is pointer-events: none, and it all disappears when the user
 * switches the tube off (html[data-crt="off"]).
 */
export default function CRTOverlay({ enabled }) {
  const noiseRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!enabled || reduced) return
    const canvas = noiseRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = 220
    const H = 140
    canvas.width = W
    canvas.height = H
    let raf = 0
    let last = 0
    const draw = (now) => {
      raf = requestAnimationFrame(draw)
      if (document.hidden || now - last < 90) return
      last = now
      const img = ctx.createImageData(W, H)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255
        d[i] = v
        d[i + 1] = v
        d[i + 2] = v
        d[i + 3] = Math.random() < 0.5 ? 10 : 0
      }
      ctx.putImageData(img, 0, 0)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [enabled, reduced])

  if (!enabled) return null

  return (
    <div className={styles.crt} aria-hidden="true">
      <div className={styles.vignette} />
      <div className={styles.scanlines} />
      <div className={styles.grille} />
      <div className={styles.sweep} />
      {!reduced && <canvas ref={noiseRef} className={styles.noise} />}
      <div className={styles.flicker} />
      <div className={styles.curvature} />
    </div>
  )
}
