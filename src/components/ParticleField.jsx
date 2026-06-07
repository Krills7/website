import { useEffect, useRef } from 'react'
import styles from './ParticleField.module.css'

const PARTICLE_COUNT = 130
const CONNECTION_DIST = 120
const REPULSION_RADIUS = 150
const WAVE_RADIUS_INITIAL = 5
const WAVE_EXPAND_SPEED = 2

function random(min, max) {
  return Math.random() * (max - min) + min
}

function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: random(-0.3, 0.3),
    vy: random(-0.3, 0.3),
    radius: random(1.5, 3),
    alpha: random(0.3, 0.7),
  }
}

export default function ParticleField() {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    particles: [],
    cursor: { x: -1000, y: -1000 },
    waves: [],
    width: 0,
    height: 0,
  })
  const rafRef = useRef(null)
  const hiddenRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = stateRef.current

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)

      state.width = w
      state.height = h

      // Reinitialize particles on resize
      state.particles = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(w, h)
      )
    }

    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)

    // ── Cursor events ──
    function onMouseMove(e) {
      state.cursor.x = e.clientX
      state.cursor.y = e.clientY
    }

    function onMouseLeave() {
      state.cursor.x = -1000
      state.cursor.y = -1000
    }

    function onMouseDown(e) {
      state.waves.push({
        x: e.clientX,
        y: e.clientY,
        radius: WAVE_RADIUS_INITIAL,
        maxRadius: Math.max(state.width, state.height) * 0.6,
      })
    }

    function onTouchMove(e) {
      const touch = e.touches[0]
      if (touch) {
        state.cursor.x = touch.clientX
        state.cursor.y = touch.clientY
      }
    }

    function onTouchEnd() {
      state.cursor.x = -1000
      state.cursor.y = -1000
    }

    function onTouchStart(e) {
      const touch = e.touches[0]
      if (touch) {
        state.waves.push({
          x: touch.clientX,
          y: touch.clientY,
          radius: WAVE_RADIUS_INITIAL,
          maxRadius: Math.max(state.width, state.height) * 0.6,
        })
      }
    }

    // ── Visibility ──
    function onVisibilityChange() {
      hiddenRef.current = document.hidden
      if (!hiddenRef.current) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    // ── Draw loop ──
    function draw() {
      if (hiddenRef.current) return

      const { particles, cursor, waves, width, height } = state

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Apply velocity
        p.x += p.vx
        p.y += p.vy

        // Edge bouncing with damping
        if (p.x < 0) { p.x = 0; p.vx *= -0.9 }
        if (p.x > width) { p.x = width; p.vx *= -0.9 }
        if (p.y < 0) { p.y = 0; p.vy *= -0.9 }
        if (p.y > height) { p.y = height; p.vy *= -0.9 }

        // Cursor repulsion
        const dx = p.x - cursor.x
        const dy = p.y - cursor.y
        const distToCursor = Math.sqrt(dx * dx + dy * dy)

        if (distToCursor < REPULSION_RADIUS && distToCursor > 0) {
          const force = (1 - distToCursor / REPULSION_RADIUS) * 0.8
          const normX = dx / distToCursor
          const normY = dy / distToCursor
          p.vx += normX * force
          p.vy += normY * force
        }

        // Clamp velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5
          p.vy = (p.vy / speed) * 1.5
        }
      }

      // Clear
      ctx.clearRect(0, 0, width, height)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12 * a.alpha * b.alpha
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 255, 136, ${p.alpha})`
        ctx.fill()
      }

      // Draw cursor ring
      if (cursor.x > 0 && cursor.y > 0) {
        const dist = Math.sqrt(
          (cursor.x - width / 2) ** 2 + (cursor.y - height / 2) ** 2
        )
        if (dist < width * 2) {
          ctx.beginPath()
          ctx.arc(cursor.x, cursor.y, REPULSION_RADIUS * 0.6, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.08)'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      // Draw and update waves
      for (let w = 0; w < waves.length; w++) {
        const wave = waves[w]
        wave.radius += WAVE_EXPAND_SPEED

        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
        const alpha = Math.max(0, 1 - wave.radius / wave.maxRadius) * 0.15
        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Apply outward force to particles near wave
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const dx = p.x - wave.x
          const dy = p.y - wave.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const diff = Math.abs(dist - wave.radius)
          if (diff < 20 && dist > 0) {
            const force = (1 - diff / 20) * 1.2
            const normX = dx / dist
            const normY = dy / dist
            p.vx += normX * force
            p.vy += normY * force
          }
        }
      }

      // Remove expired waves
      stateRef.current.waves = waves.filter(
        (w) => w.radius < w.maxRadius
      )

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.overlay}>
        <p className={styles.label}>Interactive Particle Field</p>
        <p className={styles.hint}>Move cursor to repel &bull; Click to create waves</p>
      </div>
    </div>
  )
}
