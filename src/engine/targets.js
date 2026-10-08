/**
 * Target builders for the DashField. Each builder returns an array of dashes
 * in viewport (CSS px) coordinates: { x, y, a, l, tone }.
 *
 * The same particle pool re-forms into any of these, so every visual on the
 * site is genuinely the same cloud of dashes, recycled.
 */

import { makeRng } from './dashField'

const TAU = Math.PI * 2

/** Rasterize a string into horizontal scanline dashes. */
export function textTargets(text, rect, opts = {}) {
  const {
    font = '600 64px monospace',
    step = 7,
    toneBase = 0.08,
    toneRange = 0.42,
    maxWidth = rect.width,
    wrap = false,
  } = opts
  if (!text || rect.width < 8 || rect.height < 8) return []

  const c = document.createElement('canvas')
  c.width = Math.max(8, Math.ceil(rect.width))
  c.height = Math.max(8, Math.ceil(rect.height))
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'

  let size = parseFloat(font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? '64')
  const setFont = () => {
    ctx.font = font.replace(/\d+(?:\.\d+)?px/, `${size.toFixed(1)}px`)
  }
  setFont()

  const layout = () => {
    if (!wrap) return String(text).split('\n')
    const words = String(text).replace(/\n/g, ' ').split(/\s+/).filter(Boolean)
    const out = []
    let cur = ''
    for (const word of words) {
      const candidate = cur ? `${cur} ${word}` : word
      if (cur && ctx.measureText(candidate).width > maxWidth) {
        out.push(cur)
        cur = word
      } else {
        cur = candidate
      }
    }
    if (cur) out.push(cur)
    return out.length ? out : [String(text)]
  }

  let lines = layout()
  const widest = (ls) => Math.max(...ls.map((l) => ctx.measureText(l).width), 0)
  while (widest(lines) > maxWidth && size > 8) {
    size *= 0.94
    setFont()
    lines = layout()
  }

  const band = c.height / lines.length
  lines.forEach((line, i) => {
    if (!line.trim()) return
    ctx.fillText(line, c.width / 2, band * (i + 0.5))
  })

  const data = ctx.getImageData(0, 0, c.width, c.height).data
  const out = []
  const cols = Math.floor(c.width / step)
  const rows = Math.floor(c.height / step)
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const px = Math.min(c.width - 1, Math.round((gx + 0.5) * step))
      const py = Math.min(c.height - 1, Math.round((gy + 0.5) * step))
      const alpha = data[(py * c.width + px) * 4 + 3]
      if (alpha < 110) continue
      const tone = toneBase + (alpha / 255) * toneRange * (1 - (gy / rows) * 0.35)
      out.push({
        x: rect.x + (gx + 0.5) * step,
        y: rect.y + (py / c.height) * rect.height,
        a: 0,
        l: step * 1.25,
        tone,
      })
    }
  }
  return out
}

/** A loose field of dots with a few connecting lines. */
export function networkTargets(rect, opts = {}) {
  const { nodes = 30, seed = 4 } = opts
  const rng = makeRng(seed)
  const pts = []
  for (let i = 0; i < nodes; i++) {
    pts.push({
      x: rect.x + rect.width * (0.06 + rng() * 0.88),
      y: rect.y + rect.height * (0.08 + rng() * 0.84),
    })
  }
  const out = []
  for (const p of pts) {
    out.push({ x: p.x, y: p.y, a: 0, l: 5 + rng() * 4, tone: 0.35 + rng() * 0.5 })
  }
  for (let i = 0; i < nodes; i++) {
    const a = pts[i]
    const b = pts[(i + 1 + Math.floor(rng() * 3)) % nodes]
    const d = Math.hypot(b.x - a.x, b.y - a.y)
    if (d > 220) continue
    out.push({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      a: Math.atan2(b.y - a.y, b.x - a.x),
      l: d,
      tone: 0.18 + rng() * 0.2,
    })
  }
  return out
}

/** Horizontal sine rows, like an oscilloscope. */
export function waveTargets(rect, opts = {}) {
  const { rows = 3, segments = 44, amp = 0.2, seed = 9 } = opts
  const rng = makeRng(seed)
  const out = []
  for (let r = 0; r < rows; r++) {
    const cy = rect.y + ((r + 0.5) / rows) * rect.height
    const phase = rng() * TAU
    const freq = 1.4 + rng() * 2.2
    const a = rect.height * amp * (0.45 + rng() * 0.9)
    let prev = null
    for (let i = 0; i <= segments; i++) {
      const x = rect.x + (i / segments) * rect.width
      const y = cy + Math.sin(phase + (i / segments) * TAU * freq) * a
      if (prev) {
        const d = Math.hypot(x - prev.x, y - prev.y)
        out.push({
          x: (x + prev.x) / 2,
          y: (y + prev.y) / 2,
          a: Math.atan2(y - prev.y, x - prev.x),
          l: d * 1.05,
          tone: 0.3 + rng() * 0.5,
        })
      }
      prev = { x, y }
    }
  }
  return out
}

/** A regular dot grid. */
export function gridTargets(rect, opts = {}) {
  const { gap = 26, seed = 2 } = opts
  const rng = makeRng(seed)
  const out = []
  for (let y = rect.y + gap / 2; y < rect.y + rect.height; y += gap) {
    for (let x = rect.x + gap / 2; x < rect.x + rect.width; x += gap) {
      const d = Math.hypot(x - (rect.x + rect.width / 2), y - (rect.y + rect.height / 2))
      const max = Math.hypot(rect.width, rect.height) / 2
      const tone = 0.12 + (1 - d / max) * 0.6 + rng() * 0.1
      out.push({ x, y, a: 0, l: 4 + rng() * 3, tone })
    }
  }
  return out
}

/** A wireframe globe built from latitude circles and meridian ellipses. */
export function sphereTargets(rect, opts = {}) {
  const { parallels = 8, meridians = 8, segments = 34, squash = 0.32 } = opts
  const cx = rect.x + rect.width / 2
  const cy = rect.y + rect.height / 2
  const R = Math.min(rect.width, rect.height) * 0.42
  const out = []

  const pushSeg = (ax, ay, bx, by, depth) => {
    const d = Math.hypot(bx - ax, by - ay)
    if (d < 0.2) return
    out.push({
      x: (ax + bx) / 2,
      y: (ay + by) / 2,
      a: Math.atan2(by - ay, bx - ax),
      l: d * 1.06,
      tone: 0.3 + (depth * 0.5 + 0.5) * 0.45,
    })
  }

  // Parallels: circles that flatten toward the poles.
  for (let i = 1; i < parallels; i++) {
    const lat = (i / parallels) * Math.PI
    const r = Math.sin(lat) * R
    const yy = Math.cos(lat) * R
    let prev = null
    for (let s = 0; s <= segments; s++) {
      const lon = (s / segments) * TAU
      const x = cx + Math.cos(lon) * r
      const y = cy - yy + Math.sin(lon) * r * squash
      if (prev) pushSeg(prev.x, prev.y, x, y, Math.sin(lon))
      prev = { x, y }
    }
  }

  // Meridians: great circles rotated around the vertical axis.
  for (let m = 0; m < meridians; m++) {
    const phase = (m / meridians) * Math.PI
    let prev = null
    for (let s = 0; s <= segments; s++) {
      const t = (s / segments) * TAU
      const st = Math.sin(t)
      const ct = Math.cos(t)
      const depth = st * Math.sin(phase)
      const x = cx + st * Math.cos(phase) * R
      const y = cy + ct * R - depth * R * squash
      if (prev) pushSeg(prev.x, prev.y, x, y, depth)
      prev = { x, y }
    }
  }
  return out
}

/** Concentric rings pulsing out of a center point. */
export function radialTargets(rect, opts = {}) {
  const { rings = 12, segments = 44, seed = 5 } = opts
  const rng = makeRng(seed)
  const cx = rect.x + rect.width / 2
  const cy = rect.y + rect.height / 2
  const R = Math.min(rect.width, rect.height) * 0.46
  const out = []
  for (let r = 1; r <= rings; r++) {
    const rr = (r / rings) * R
    let prev = null
    for (let s = 0; s <= segments; s++) {
      const ang = (s / segments) * TAU
      const x = cx + Math.cos(ang) * rr
      const y = cy + Math.sin(ang) * rr
      if (prev) {
        const d = Math.hypot(x - prev.x, y - prev.y)
        out.push({
          x: (x + prev.x) / 2,
          y: (y + prev.y) / 2,
          a: Math.atan2(y - prev.y, x - prev.x),
          l: d * 1.05,
          tone: 0.5 - (r / rings) * 0.35 + rng() * 0.1,
        })
      }
      prev = { x, y }
    }
  }
  return out
}
