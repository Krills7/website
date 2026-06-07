import { useEffect, useRef } from 'react'
import styles from './CursorGlow.module.css'

const DOT_SPACING = 40
const GLOW_RADIUS = 500
const PARTICLE_RADIUS = 200
const LERP_FACTOR = 0.08

export default function CursorGlow() {
  const canvasRef = useRef(null)
  const cursor = useRef({ x: -1000, y: -1000 })
  const smooth = useRef({ x: -1000, y: -1000 })
  const dotsRef = useRef([])
  const rafRef = useRef(null)
  const isReduced = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check reduced motion preference
    isReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)

      // Pre-compute dot positions
      const dots = []
      for (let x = 0; x < w; x += DOT_SPACING) {
        for (let y = 0; y < h; y += DOT_SPACING) {
          dots.push({ x, y })
        }
      }
      dotsRef.current = dots
    }

    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)

    function onMouseMove(e) {
      cursor.current.x = e.clientX
      cursor.current.y = e.clientY
    }

    function onMouseLeave() {
      cursor.current.x = -1000
      cursor.current.y = -1000
    }

    function onTouchMove(e) {
      const touch = e.touches[0]
      if (touch) {
        cursor.current.x = touch.clientX
        cursor.current.y = touch.clientY
      }
    }

    function onTouchEnd() {
      cursor.current.x = -1000
      cursor.current.y = -1000
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    function draw() {
      if (isReduced.current) {
        // Static subtle gradient
        const grad = ctx.createRadialGradient(
          window.innerWidth / 2, window.innerHeight / 2, 0,
          window.innerWidth / 2, window.innerHeight / 2, GLOW_RADIUS
        )
        grad.addColorStop(0, 'rgba(0, 255, 136, 0.03)')
        grad.addColorStop(1, 'transparent')
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
        return
      }

      // Smooth interpolation
      smooth.current.x += (cursor.current.x - smooth.current.x) * LERP_FACTOR
      smooth.current.y += (cursor.current.y - smooth.current.y) * LERP_FACTOR

      const sx = smooth.current.x
      const sy = smooth.current.y

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // Draw dots
      const dots = dotsRef.current
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        const dx = d.x - sx
        const dy = d.y - sy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximity = Math.max(0, 1 - dist / PARTICLE_RADIUS)

        if (proximity > 0) {
          const alpha = 0.06 + proximity * 0.25
          const size = 1.5 + proximity * 2
          ctx.beginPath()
          ctx.arc(d.x, d.y, size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(139, 148, 158, 0.06)'
          ctx.fill()
        }
      }

      // Draw radial glow
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, GLOW_RADIUS)
      grad.addColorStop(0, 'rgba(0, 255, 136, 0.03)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-hidden="true"
    />
  )
}
