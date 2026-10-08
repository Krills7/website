import { useEffect, useRef } from 'react'
import { registerZone, unregisterZone } from '../engine/particleRegistry'
import styles from './ParticleZone.module.css'

/**
 * Declares a shape in the global particle cloud. The zone element is an
 * invisible overlay; the ParticleLayer rasterizes its text or draws its
 * shape at the zone's screen position when the zone is near the viewport
 * center.
 */
export default function ParticleZone({
  id,
  kind = 'text',
  text = '',
  priority = 0,
  step,
  maxFontSize,
  font,
  wrap = false,
  className,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const zone = { id, kind, text, priority, step, maxFontSize, font, wrap, el }
    registerZone(zone)
    return () => unregisterZone(id)
  }, [id, kind, text, priority, step, maxFontSize, font, wrap])

  return (
    <span
      ref={ref}
      data-particle-zone={id}
      className={`${styles.zone} ${className ?? ''}`}
      aria-hidden="true"
    />
  )
}
