import { useEffect, useRef } from 'react'
import { DashField, clamp } from '../engine/dashField'
import { getZones, subscribeZones } from '../engine/particleRegistry'
import {
  gridTargets,
  networkTargets,
  radialTargets,
  sphereTargets,
  textTargets,
  waveTargets,
} from '../engine/targets'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ParticleLayer.module.css'

function fontFor(zone) {
  if (zone.font) return zone.font
  const cs = getComputedStyle(zone.el)
  const size = Math.min(parseFloat(cs.fontSize) || 48, zone.maxFontSize ?? 220)
  return `${cs.fontWeight || 600} ${size}px ${cs.fontFamily || 'monospace'}`
}

function fit(rect, maxHeight) {
  if (rect.height <= maxHeight) return rect
  const y = rect.y + (rect.height - maxHeight) / 2
  return { ...rect, y, height: maxHeight }
}

function buildTargets(zone, rect) {
  switch (zone.kind) {
    case 'text':
      return textTargets(zone.text ?? zone.el.textContent ?? '', rect, {
        font: fontFor(zone),
        wrap: zone.wrap,
        step: zone.step ?? Math.max(6, Math.min(11, (parseFloat(getComputedStyle(zone.el).fontSize) || 48) / 12)),
      })
    case 'network':
      return networkTargets(fit(rect, 520))
    case 'wave':
      return waveTargets(fit(rect, 280))
    case 'grid':
      return gridTargets(fit(rect, 520))
    case 'sphere':
      return sphereTargets(rect)
    case 'radial':
      return radialTargets(rect)
    default:
      return []
  }
}

/**
 * One fixed canvas behind the whole app. A single pool of dashes flows
 * between particle zones as you scroll or change pages — the same particles
 * are recycled for every visual on the site.
 */
export default function ParticleLayer() {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const count = Math.round(clamp(420, (window.innerWidth * window.innerHeight) / 1750, 1250))
    const field = new DashField(canvas, { count })
    let vw = 0
    let vh = 0
    let raf = 0
    let last = performance.now()
    let activeId = null
    let activeKey = null
    let opacity = 0
    let disposed = false
    let zonesDirty = true
    let staticRender = null

    const unsub = subscribeZones(() => {
      zonesDirty = true
      if (staticRender) staticRender()
    })

    // Re-rasterize text zones once the webfonts have actually loaded.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        activeKey = null
        zonesDirty = true
      })
    }

    const resize = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      field.resize(vw, vh, dpr)
      zonesDirty = true
      // Seed the cloud with a drifting field so the first morph feels alive.
      const targets = []
      for (let i = 0; i < count; i++) {
        targets.push({
          x: Math.random() * vw,
          y: Math.random() * vh,
          a: Math.random() * Math.PI,
          l: 4 + Math.random() * 6,
          tone: 0.15 + Math.random() * 0.25,
        })
      }
      field.setTargets(targets, { immediate: true })
      opacity = 0
    }

    resize()
    window.addEventListener('resize', resize)

    const pickZone = () => {
      const zones = getZones()
      let best = null
      let bestScore = 0.02
      for (const zone of zones) {
        const el = zone.el
        if (!el || !el.isConnected) continue
        const box = el.getBoundingClientRect()
        if (box.width < 10 || box.height < 10) continue
        if (box.bottom < 0 || box.top > vh) continue
        const cy = box.top + box.height / 2
        const dist = Math.abs(cy - vh * 0.5)
        const score = 1 - dist / (vh * 0.95) + (zone.priority ?? 0) * 0.05
        if (score > bestScore) {
          bestScore = score
          // DOMRect fields live on the prototype, so copy them into a plain object.
          best = {
            zone,
            rect: { x: box.x, y: box.y, width: box.width, height: box.height },
          }
        }
      }
      return best
    }

    const retarget = (zone, rect, first = false) => {
      const key = `${zone.id}:${Math.round(rect.width)}x${Math.round(rect.height)}:${zone.text ?? ''}`
      if (key === activeKey && !zonesDirty) return
      const targets = buildTargets(zone, rect)
      if (targets.length === 0) return
      activeKey = key
      field.setTargets(targets, {
        duration: first ? 2.2 : 1.5,
        stagger: 0.62,
        arc: 1,
      })
    }

    const frame = (now) => {
      if (disposed) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (document.hidden) return

      const pick = pickZone()
      let active = false
      if (pick) {
        if (pick.zone.id !== activeId) {
          activeId = pick.zone.id
          zonesDirty = false
          retarget(pick.zone, pick.rect, activeKeys.has(pick.zone.id) ? false : true)
          activeKeys.add(pick.zone.id)
        } else if (zonesDirty || Math.abs(pick.rect.width - lastZoneW) > 2 || Math.abs(pick.rect.height - lastZoneH) > 2) {
          zonesDirty = false
          retarget(pick.zone, pick.rect)
        }
        lastZoneW = pick.rect.width
        lastZoneH = pick.rect.height
        active = true
      }
      const targetOpacity = active ? 0.85 : 0.12
      opacity += (targetOpacity - opacity) * Math.min(1, dt * 3)

      field.step(dt)
      field.render(now / 1000, { alpha: opacity })
    }

    let lastZoneW = 0
    let lastZoneH = 0
    const activeKeys = new Set()

    if (reduced) {
      // Static, quiet rendering: place the cloud once, no motion — and
      // re-place it whenever a zone registers (e.g. after a route change).
      const renderStatic = () => {
        const pick = pickZone()
        if (pick) {
          activeId = pick.zone.id
          activeKey = null
          retarget(pick.zone, pick.rect, true)
        }
        field.step(10)
        field.render(0, { alpha: 0.5 })
      }
      staticRender = renderStatic
      renderStatic()
      const onResizeStatic = () => {
        resize()
        renderStatic()
      }
      window.addEventListener('resize', onResizeStatic)
      return () => {
        disposed = true
        staticRender = null
        unsub()
        window.removeEventListener('resize', resize)
        window.removeEventListener('resize', onResizeStatic)
      }
    }

    const onPointer = (e) => field.setPointer(e.clientX, e.clientY, true)
    const onLeave = () => field.setPointer(0, 0, false)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerout', onLeave)
    window.addEventListener('blur', onLeave)

    raf = requestAnimationFrame(frame)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      unsub()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerout', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
