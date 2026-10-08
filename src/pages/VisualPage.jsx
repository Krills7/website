import { useEffect, useRef, useState } from 'react'
import { DashField } from '../engine/dashField'
import {
  gridTargets,
  networkTargets,
  radialTargets,
  sphereTargets,
  textTargets,
  waveTargets,
} from '../engine/targets'
import { useReducedMotion } from '../hooks/useReducedMotion'
import ParticleZone from '../components/ParticleZone'
import styles from './VisualPage.module.css'

const POSES = [
  { id: 'text', label: 'text' },
  { id: 'sphere', label: 'sphere' },
  { id: 'grid', label: 'grid' },
  { id: 'wave', label: 'wave' },
  { id: 'network', label: 'network' },
  { id: 'radial', label: 'radial' },
]

function rectOf(el) {
  const r = el.getBoundingClientRect()
  return { x: 0, y: 0, width: Math.max(1, r.width), height: Math.max(1, r.height), cx: r.width / 2, cy: r.height / 2 }
}

function buildPose(id, rect) {
  switch (id) {
    case 'text': {
      const size = Math.min(rect.height * 0.42, rect.width / 6.4)
      return textTargets('DB-OS', rect, {
        font: `700 ${Math.max(28, size)}px "Space Grotesk", monospace`,
        step: Math.max(6, size / 14),
      })
    }
    case 'sphere':
      return sphereTargets(rect)
    case 'grid':
      return gridTargets(rect, { gap: Math.max(20, rect.width / 46) })
    case 'wave':
      return waveTargets(rect)
    case 'network':
      return networkTargets(rect, { nodes: 34 })
    case 'radial':
    default:
      return radialTargets(rect)
  }
}

export default function VisualPage() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const fieldRef = useRef(null)
  const poseRef = useRef('text')
  const pulseTimer = useRef(0)
  const [pose, setPose] = useState('text')
  const [count, setCount] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    poseRef.current = pose
    const field = fieldRef.current
    const wrap = wrapRef.current
    if (!field || !wrap) return
    field.setTargets(buildPose(pose, rectOf(wrap)), { duration: 1.2, stagger: 0.5 })
  }, [pose])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const count = Math.max(500, Math.min(1500, Math.round((wrap.clientWidth * wrap.clientHeight) / 1200)))
    const field = new DashField(canvas, { count })
    fieldRef.current = field
    setCount(count)

    const resize = () => {
      const r = rectOf(wrap)
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      field.resize(r.width, r.height, dpr)
      field.setTargets(buildPose(poseRef.current, r), { duration: 1.1, stagger: 0.55 })
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      field.step(dt)
      field.render(now / 1000, { alpha: 0.95 })
    }
    if (!reduced) raf = requestAnimationFrame(loop)

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect()
      field.setPointer(e.clientX - r.left, e.clientY - r.top, true)
      if (reduced) {
        field.step(0.016)
        field.render(0, { alpha: 0.95 })
      }
    }
    const onLeave = () => field.setPointer(0, 0, false)

    const onDown = (e) => {
      const r = wrap.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      // A collapsing ring of dashes around the click point.
      const targets = []
      for (let ring = 1; ring <= 10; ring++) {
        const radius = 40 + ring * 34
        const segments = Math.max(18, Math.round(radius / 6))
        for (let s = 0; s < segments; s++) {
          const a = (s / segments) * Math.PI * 2
          targets.push({
            x: px + Math.cos(a) * radius,
            y: py + Math.sin(a) * radius,
            a: a + Math.PI / 2,
            l: 7,
            tone: 0.9 - ring * 0.06,
          })
        }
      }
      field.setTargets(targets, { duration: 0.55, stagger: 0.35, arc: 0.4 })
      window.clearTimeout(pulseTimer.current)
      pulseTimer.current = window.setTimeout(() => {
        const r2 = rectOf(wrap)
        field.setTargets(buildPose(poseRef.current, r2), { duration: 1.1, stagger: 0.6 })
      }, 1000)
    }

    wrap.addEventListener('pointermove', onMove, { passive: true })
    wrap.addEventListener('pointerleave', onLeave)
    wrap.addEventListener('pointerdown', onDown)

    if (reduced) field.render(0, { alpha: 0.95 })

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(pulseTimer.current)
      ro.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
      wrap.removeEventListener('pointerdown', onDown)
      fieldRef.current = null
    }
  }, [reduced])

  return (
    <section className={styles.page}>
      <div className={`shell ${styles.head}`}>
        <ParticleZone
          id="lab-title"
          text="PARTICLES.EXE"
          font='700 130px "Space Grotesk", monospace'
          step={9}
          priority={2}
        />
        <p className="eyebrow">particles.exe — the lab</p>
        <h1 className={styles.title}>One cloud of dashes</h1>
        <p className={styles.lead}>
          Move the cursor to push the particles around; click anywhere to collapse a ring into
          them. Every shape below is the same recycled pool of {count.toLocaleString()} dashes —
          exactly what flows behind the rest of this site.
        </p>
        <div className={styles.controls} role="group" aria-label="Particle shape">
          {POSES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.pose} ${pose === p.id ? styles.poseActive : ''}`}
              aria-pressed={pose === p.id}
              onClick={() => setPose(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.stage} ref={wrapRef}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.overlay} aria-hidden="true">
          <span>move · click · morph</span>
          <span>pool: {count} dashes · canvas 2d</span>
        </div>
      </div>
    </section>
  )
}
