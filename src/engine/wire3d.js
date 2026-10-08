/**
 * Wire3D — a tiny software 3D engine for glowing wireframes on a 2D canvas.
 *
 * Geometry is built on the CPU as line segments in a virtual 3D space. A
 * pinhole camera projects them to the screen; segments are batched by tone
 * and drawn twice (a wide faint "glow" pass under a thin bright core pass)
 * to fake CRT phosphor bloom.
 *
 * Scroll-driven "lit" and "focus" values per group decide what is visible
 * and how bright it burns, which is how the workflow section assembles its
 * three scenes as you scroll.
 */

const TAU = Math.PI * 2

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

export const smooth = (t) => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/** 0 before a, 1 after b. */
export const range = (p, a, b) => smooth((p - a) / (b - a || 1))

/** Fade in between a..b and back out between c..d. */
export const window01 = (p, a, b, c, d) => range(p, a, b) * (1 - range(p, c, d))

const mix = (a, b, t) => a + (b - a) * t

export class Wire {
  constructor() {
    this.segments = []
    this.labels = []
    this.defaults = { tone: 0.7, width: 1, dash: 0, flow: 0, gain: 1 }
    this.current = { ...this.defaults }
  }

  /** Set the style applied to segments added after this call. */
  use(style = {}) {
    this.current = { ...this.defaults, ...style }
    return this
  }

  reset() {
    this.current = { ...this.defaults }
    return this
  }

  seg(a, b, style = {}) {
    const s = { ...this.current, ...style }
    this.segments.push({ a, b, s, g: s.group })
    return this
  }

  poly(points, style = {}) {
    for (let i = 1; i < points.length; i++) this.seg(points[i - 1], points[i], style)
    return this
  }

  close(points, style = {}) {
    this.poly(points, style)
    if (points.length > 2) this.seg(points[points.length - 1], points[0], style)
    return this
  }

  box(min, max, style = {}) {
    const [x1, y1, z1] = min
    const [x2, y2, z2] = max
    const c = [
      [x1, y1, z1],
      [x2, y1, z1],
      [x2, y2, z1],
      [x1, y2, z1],
      [x1, y1, z2],
      [x2, y1, z2],
      [x2, y2, z2],
      [x1, y2, z2],
    ]
    this.close([c[0], c[1], c[2], c[3]], style)
    this.close([c[4], c[5], c[6], c[7]], style)
    for (let i = 0; i < 4; i++) this.seg(c[i], c[i + 4], style)
    return this
  }

  /** A ring in the plane spanned by u,v around center. */
  ring(center, radius, { segments = 40, u = [1, 0, 0], v = [0, 1, 0], from = 0, to = TAU, style = {} } = {}) {
    const [cx, cy, cz] = center
    let prev = null
    for (let i = 0; i <= segments; i++) {
      const ang = from + (i / segments) * (to - from)
      const ca = Math.cos(ang) * radius
      const sa = Math.sin(ang) * radius
      const p = [cx + u[0] * ca + v[0] * sa, cy + u[1] * ca + v[1] * sa, cz + u[2] * ca + v[2] * sa]
      if (prev) this.seg(prev, p, style)
      prev = p
    }
    return this
  }

  label(anchor, title, note, opts = {}) {
    this.labels.push({
      anchor,
      title,
      note,
      side: opts.side ?? 1,
      lift: opts.lift ?? 0,
      fade: opts.fade ?? null, // [a, b, c, d] progress window
      id: opts.id,
    })
    return this
  }
}

// ── Icosahedron subdivision (wireframe sphere) ──────────────────
const PHI = (1 + Math.sqrt(5)) / 2

function normalize(v) {
  const d = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / d, v[1] / d, v[2] / d]
}

function icosahedron() {
  const verts = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  ].map(normalize)
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ]
  return { verts, faces }
}

export function geodesic(subdiv = 1) {
  let { verts, faces } = icosahedron()
  for (let s = 0; s < subdiv; s++) {
    const cache = new Map()
    const nv = [...verts]
    const mid = (a, b) => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`
      if (cache.has(key)) return cache.get(key)
      const p = normalize([
        (verts[a][0] + verts[b][0]) / 2,
        (verts[a][1] + verts[b][1]) / 2,
        (verts[a][2] + verts[b][2]) / 2,
      ])
      nv.push(p)
      const idx = nv.length - 1
      cache.set(key, idx)
      return idx
    }
    const nf = []
    for (const [a, b, c] of faces) {
      const ab = mid(a, b)
      const bc = mid(b, c)
      const ca = mid(c, a)
      nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
    }
    verts = nv
    faces = nf
  }
  const edges = new Set()
  const out = []
  for (const [a, b, c] of faces) {
    for (const [x, y] of [[a, b], [b, c], [c, a]]) {
      const key = x < y ? `${x}:${y}` : `${y}:${x}`
      if (edges.has(key)) continue
      edges.add(key)
      out.push([verts[x], verts[y]])
    }
  }
  return out
}

// ── Camera ──────────────────────────────────────────────────────
export function makeCamera(rect, opts = {}) {
  return {
    cx: rect.x + rect.width / 2,
    cy: rect.y + rect.height / 2,
    target: opts.target ?? [0, 0, 0],
    yaw: opts.yaw ?? 0.4,
    pitch: opts.pitch ?? 0.3,
    dist: opts.dist ?? 1900,
    fov: opts.fov ?? Math.max(520, Math.min(rect.width, rect.height) * 1.9),
    width: rect.width,
    height: rect.height,
  }
}

export function project(p, cam) {
  const x = p[0] - cam.target[0]
  const y = p[1] - cam.target[1]
  const z = p[2] - cam.target[2]
  const cy = Math.cos(cam.yaw)
  const sy = Math.sin(cam.yaw)
  const x1 = x * cy + z * sy
  const z1 = -x * sy + z * cy
  const cp = Math.cos(cam.pitch)
  const sp = Math.sin(cam.pitch)
  const y1 = y * cp - z1 * sp
  const z2 = y * sp + z1 * cp
  const denom = cam.dist + z2
  if (denom < 120) return null
  const s = cam.fov / denom
  return {
    x: cam.cx + x1 * s,
    y: cam.cy - y1 * s,
    z: z2,
    s,
  }
}

// ── Tone palette (green → amber → cyan) ────────────────────────
const PALETTE = [
  [0.0, [70, 227, 154]],
  [0.55, [255, 182, 72]],
  [0.85, [89, 205, 240]],
  [1.0, [217, 242, 234]],
]

function toneColor(tone) {
  const t = clamp01(tone)
  for (let i = 1; i < PALETTE.length; i++) {
    const [stop, c1] = PALETTE[i - 1]
    const [stop2, c2] = PALETTE[i]
    if (t <= stop2) {
      const f = (t - stop) / (stop2 - stop || 1)
      return [
        Math.round(mix(c1[0], c2[0], f)),
        Math.round(mix(c1[1], c2[1], f)),
        Math.round(mix(c1[2], c2[2], f)),
      ]
    }
  }
  return PALETTE[PALETTE.length - 1][1]
}

export { toneColor }


/**
 * Draw a small set of moving segments (scan rings, pulses, motes). Same
 * batching approach as renderWire but rebuilt every frame by the caller.
 *
 * @param {{a: number[], b: number[], tone?: number, alpha?: number, width?: number, dash?: number[], flow?: number}[]} items
 */
export function renderDynamic(ctx, cam, items, opts = {}) {
  const time = opts.time ?? 0
  const BUCKETS = 8
  const solid = Array.from({ length: BUCKETS }, () => [])
  const dashed = []
  for (const item of items) {
    const pa = project(item.a, cam)
    const pb = project(item.b, cam)
    if (!pa || !pb) continue
    const alpha = item.alpha ?? 1
    if (alpha <= 0.01) continue
    const tone = clamp01(item.tone ?? 0.7)
    const coords = [pa.x, pa.y, pb.x, pb.y]
    if (item.dash) dashed.push({ coords, tone, alpha, dash: item.dash, flow: item.flow ?? 1 })
    else {
      const b = Math.min(BUCKETS - 1, Math.floor(tone * BUCKETS))
      solid[b].push(...coords, alpha, item.width ?? 1.2)
    }
  }

  ctx.lineCap = 'round'
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < BUCKETS; i++) {
    const arr = solid[i]
    if (arr.length === 0) continue
    const [r, g, b] = toneColor((i + 0.5) / BUCKETS)
    ctx.beginPath()
    for (let j = 0; j < arr.length; j += 6) {
      ctx.moveTo(arr[j], arr[j + 1])
      ctx.lineTo(arr[j + 2], arr[j + 3])
    }
    ctx.strokeStyle = `rgba(${r},${g},${b},${(arr[4] * 0.1).toFixed(3)})`
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.beginPath()
    for (let j = 0; j < arr.length; j += 6) {
      ctx.moveTo(arr[j], arr[j + 1])
      ctx.lineTo(arr[j + 2], arr[j + 3])
    }
    ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(1, arr[4] * 0.95).toFixed(3)})`
    ctx.lineWidth = 1.3
    ctx.stroke()
  }
  for (const d of dashed) {
    const [r, g, b] = toneColor(d.tone)
    ctx.beginPath()
    ctx.moveTo(d.coords[0], d.coords[1])
    ctx.lineTo(d.coords[2], d.coords[3])
    ctx.strokeStyle = `rgba(${r},${g},${b},${(d.alpha * 0.75).toFixed(3)})`
    ctx.lineWidth = 1.3
    ctx.setLineDash(d.dash)
    ctx.lineDashOffset = -time * 40 * d.flow
    ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Draw the scene.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Wire} wire
 * @param {object} cam
 * @param {{lit: Record<string, number>, gain?: Record<string, number>}} state
 * @param {{time: number, alpha?: number, labelFont?: string}} opts
 */
export function renderWire(ctx, wire, cam, state, opts = {}) {
  const { lit = {}, gain = {} } = state
  const time = opts.time ?? 0
  const alpha = opts.alpha ?? 1
  const w = opts.width ?? ctx.canvas.width
  const h = opts.height ?? ctx.canvas.height

  // Project all segments and bucket them.
  const BUCKETS = 12
  const solid = Array.from({ length: BUCKETS }, () => [])
  const dashed = []

  for (const seg of wire.segments) {
    const l = lit[seg.g] // group name, or undefined for always-on
    if (l !== undefined && l <= 0.015) continue
    const g = gain[seg.g] ?? 1
    const a = project(seg.a, cam)
    const b = project(seg.b, cam)
    if (!a || !b) continue
    // Depth fade: farther segments are dimmer.
    const depth = clamp01(0.5 + (cam.dist - (a.z + b.z) * 0.5) / (cam.dist * 2.4))
    const amp = (l ?? 1) * g * alpha * (0.35 + depth * 0.85)
    if (amp <= 0.015) continue
    const item = [a.x, a.y, b.x, b.y]
    if (seg.s.dash > 0) {
      dashed.push({ xy: item, tone: seg.s.tone, amp, dash: seg.s.dash, flow: seg.s.flow })
    } else {
      const bucket = Math.min(BUCKETS - 1, Math.floor(seg.s.tone * BUCKETS))
      solid[bucket].push(...item, amp, seg.s.width)
    }
  }

  ctx.lineCap = 'round'
  ctx.globalCompositeOperation = 'lighter'

  // ── Glow pass ──
  for (let i = 0; i < BUCKETS; i++) {
    const arr = solid[i]
    if (arr.length === 0) continue
    const tone = (i + 0.5) / BUCKETS
    const [r, g, b] = toneColor(tone)
    ctx.beginPath()
    for (let j = 0; j < arr.length; j += 6) {
      ctx.moveTo(arr[j], arr[j + 1])
      ctx.lineTo(arr[j + 2], arr[j + 3])
    }
    let maxAmp = 0
    for (let j = 4; j < arr.length; j += 6) maxAmp = Math.max(maxAmp, arr[j])
    ctx.strokeStyle = `rgba(${r},${g},${b},${(maxAmp * 0.075).toFixed(3)})`
    ctx.lineWidth = 6
    ctx.stroke()
  }

  // ── Core pass ──
  for (let i = 0; i < BUCKETS; i++) {
    const arr = solid[i]
    if (arr.length === 0) continue
    const tone = (i + 0.5) / BUCKETS
    const [r, g, b] = toneColor(tone)
    ctx.beginPath()
    for (let j = 0; j < arr.length; j += 6) {
      ctx.moveTo(arr[j], arr[j + 1])
      ctx.lineTo(arr[j + 2], arr[j + 3])
    }
    const sample = arr.length >= 6 ? arr[4] : 1
    ctx.strokeStyle = `rgba(${r},${g},${b},${(Math.min(1, sample) * 0.85).toFixed(3)})`
    ctx.lineWidth = 1.1
    ctx.stroke()
  }

  // ── Dashed flow pass (marching dashes) ──
  for (const d of dashed) {
    const [r, g, b] = toneColor(d.tone)
    ctx.beginPath()
    ctx.moveTo(d.xy[0], d.xy[1])
    ctx.lineTo(d.xy[2], d.xy[3])
    ctx.strokeStyle = `rgba(${r},${g},${b},${(d.amp * 0.6).toFixed(3)})`
    ctx.lineWidth = 1.2
    ctx.setLineDash(d.dash)
    ctx.lineDashOffset = -time * 46 * (d.flow || 1)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.globalCompositeOperation = 'source-over'

  // ── Labels ──
  for (const label of wire.labels) {
    let a = 1
    if (label.fade) {
      a = window01(state.p ?? 0, ...label.fade)
    }
    if (state.focus?.[label.id] !== undefined) a *= state.focus[label.id]
    if (a <= 0.02) continue
    const p = project(label.anchor, cam)
    if (!p || p.x < -80 || p.x > w + 80 || p.y < -60 || p.y > h + 60) continue
    const dir = label.side >= 0 ? 1 : -1
    const lx = p.x + dir * 46
    const ly = p.y - 26 - label.lift
    const [r, g, b] = toneColor(0.72)
    ctx.globalAlpha = Math.min(1, a)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(lx, ly)
    ctx.lineTo(lx + dir * Math.max(60, label.title.length * 9), ly)
    ctx.stroke()
    ctx.fillStyle = `rgba(${r},${g},${b},0.95)`
    ctx.beginPath()
    ctx.arc(p.x, p.y, 2.5, 0, TAU)
    ctx.fill()
    ctx.font = '600 12px "IBM Plex Mono", monospace'
    ctx.textAlign = dir > 0 ? 'left' : 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(217,242,234,0.92)'
    ctx.fillText(label.title, lx + dir * 8, ly - 7)
    if (label.note) {
      ctx.font = '400 10px "IBM Plex Mono", monospace'
      ctx.fillStyle = 'rgba(141,176,168,0.8)'
      ctx.fillText(label.note, lx + dir * 8, ly + 8)
    }
    ctx.globalAlpha = 1
  }
}
