/**
 * DashField — a recyclable pool of glowing dashes on a 2D canvas.
 *
 * Every visual in this site is built from the same primitive: a short line
 * segment (a "dash") with a position, angle, length, tone, and seed. A fixed
 * pool of dashes is re-used for every pose — the cloud never fades out and
 * back in, it flows from one shape to the next, carrying the same particles
 * through the whole experience.
 */

const TAU = Math.PI * 2

export const clamp = (v, min, max) => (v < min ? min : v > max ? max : v)

export const smoothstep = (t) => {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

export const mapRange = (v, a, b) => clamp((v - a) / (b - a || 1), 0, 1)

/** Deterministic PRNG so the field looks identical across reloads. */
export function makeRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967295
  }
}

const frac = (v) => v - Math.floor(v)

export class DashField {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{count?: number, c1?: number[], c2?: number[], seed?: number}} opts
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.count = opts.count ?? 1100
    this.c1 = opts.c1 ?? [70, 227, 154] // phosphor green
    this.c2 = opts.c2 ?? [255, 182, 72] // amber
    const rng = makeRng(opts.seed ?? 7)

    const n = this.count
    // Base (settled) state
    this.bx = new Float32Array(n)
    this.by = new Float32Array(n)
    this.ba = new Float32Array(n)
    this.bl = new Float32Array(n)
    this.bt = new Float32Array(n)
    // Morph origin state
    this.fx = new Float32Array(n)
    this.fy = new Float32Array(n)
    this.fa = new Float32Array(n)
    this.fl = new Float32Array(n)
    this.ft = new Float32Array(n)
    // Morph destination state
    this.tx = new Float32Array(n)
    this.ty = new Float32Array(n)
    this.ta = new Float32Array(n)
    this.tl = new Float32Array(n)
    this.tt = new Float32Array(n)
    // Per-particle personality
    this.seed = new Float32Array(n)
    this.stagger = new Float32Array(n)
    this.bend = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      this.seed[i] = rng()
      this.stagger[i] = rng()
      this.bend[i] = rng() < 0.5 ? -1 : 1
    }

    // Pointer push (spring-damped offset, applied at draw time only)
    this.ox = new Float32Array(n)
    this.oy = new Float32Array(n)
    this.vx = new Float32Array(n)
    this.vy = new Float32Array(n)

    this.pointer = { x: -1e5, y: -1e5, active: false }
    this.morph = { elapsed: 0, duration: 1.4, stagger: 0.6, arc: 1 }
    this.animating = false
    this.width = 1
    this.height = 1
    this.dpr = 1
    this.hasTargets = false
    this.opacity = opts.opacity ?? 1
  }

  resize(width, height, dpr) {
    this.width = width
    this.height = height
    this.dpr = dpr
    this.canvas.width = Math.max(1, Math.floor(width * dpr))
    this.canvas.height = Math.max(1, Math.floor(height * dpr))
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  get isAnimating() {
    return this.animating
  }

  /** Fill the pool from a target list: {x, y, a, l, tone}. */
  setTargets(targets, { duration = 1.5, stagger = 0.6, arc = 1, immediate = false } = {}) {
    const n = this.count
    const k = targets.length
    if (k === 0) {
      // Collapse everything to invisible points at current positions.
      for (let i = 0; i < n; i++) {
        this.tx[i] = this.bx[i]
        this.ty[i] = this.by[i]
        this.ta[i] = this.ba[i]
        this.tl[i] = 0
        this.tt[i] = 0
      }
      this.hasTargets = false
    } else {
      for (let i = 0; i < n; i++) {
        const target = targets[Math.floor((i / n) * k)]
        const s = this.seed[i]
        const jx = (frac(s * 91.7 + i * 0.618) - 0.5) * 2.4
        const jy = (frac(s * 43.1 + i * 0.382) - 0.5) * 2.4
        this.tx[i] = target.x + jx
        this.ty[i] = target.y + jy
        this.ta[i] = target.a ?? 0
        this.tl[i] = target.l ?? 6
        this.tt[i] = target.tone ?? 0.6
      }
      this.hasTargets = true
    }
    if (immediate) {
      for (let i = 0; i < n; i++) {
        this.bx[i] = this.tx[i]
        this.by[i] = this.ty[i]
        this.ba[i] = this.ta[i]
        this.bl[i] = this.tl[i]
        this.bt[i] = this.tt[i]
        this.fx[i] = this.bx[i]
        this.fy[i] = this.by[i]
        this.fa[i] = this.ba[i]
        this.fl[i] = this.bl[i]
        this.ft[i] = this.bt[i]
      }
      this.morph.elapsed = 999
      this.animating = false
      return
    }
    for (let i = 0; i < n; i++) {
      this.fx[i] = this.bx[i]
      this.fy[i] = this.by[i]
      this.fa[i] = this.ba[i]
      this.fl[i] = this.bl[i]
      this.ft[i] = this.bt[i]
    }
    this.morph = { elapsed: 0, duration, stagger, arc }
    this.animating = true
  }

  setPointer(x, y, active) {
    this.pointer.x = x
    this.pointer.y = y
    this.pointer.active = active
  }

  /** Advance the morph and pointer springs. dt in seconds. */
  step(dt) {
    const n = this.count
    const m = this.morph
    if (this.animating) m.elapsed += dt
    const inv = 1 / Math.max(0.2, m.duration)
    const span = Math.max(0.05, 1 - m.stagger)
    let active = false

    for (let i = 0; i < n; i++) {
      const delay = this.stagger[i] * m.stagger
      const q = smoothstep((m.elapsed * inv - delay) / span)
      if (q < 1) active = true
      this.bx[i] = this.fx[i] + (this.tx[i] - this.fx[i]) * q
      this.by[i] = this.fy[i] + (this.ty[i] - this.fy[i]) * q
      // Shortest-path angle interpolation
      let da = this.ta[i] - this.fa[i]
      if (da > Math.PI) da -= TAU
      if (da < -Math.PI) da += TAU
      this.ba[i] = this.fa[i] + da * q
      this.bl[i] = this.fl[i] + (this.tl[i] - this.fl[i]) * q
      this.bt[i] = this.ft[i] + (this.tt[i] - this.ft[i]) * q
      // Curved travel: bow out perpendicular to the direction of motion
      if (q > 0 && q < 1) {
        const dx = this.tx[i] - this.fx[i]
        const dy = this.ty[i] - this.fy[i]
        const d = Math.hypot(dx, dy) || 1
        const bow = Math.sin(Math.PI * q) * Math.min(70, d * 0.45) * m.arc
        this.bx[i] += (-dy / d) * this.bend[i] * bow
        this.by[i] += (dx / d) * this.bend[i] * bow
      }
    }

    // Pointer springs
    const p = this.pointer
    if (p.active) {
      const R = 170
      const R2 = R * R
      for (let i = 0; i < n; i++) {
        const dx = this.bx[i] + this.ox[i] - p.x
        const dy = this.by[i] + this.oy[i] - p.y
        const d2 = dx * dx + dy * dy
        if (d2 < R2 && d2 > 1) {
          const d = Math.sqrt(d2)
          const f = (1 - d / R) ** 2 * 2600 * dt
          this.vx[i] += (dx / d) * f
          this.vy[i] += (dy / d) * f
          active = true
        }
      }
    }
    for (let i = 0; i < n; i++) {
      const k = 26
      const c = 7
      this.vx[i] += (-k * this.ox[i] - c * this.vx[i]) * dt
      this.vy[i] += (-k * this.oy[i] - c * this.vy[i]) * dt
      this.ox[i] += this.vx[i] * dt
      this.oy[i] += this.vy[i] * dt
      if (
        Math.abs(this.ox[i]) > 0.05 ||
        Math.abs(this.oy[i]) > 0.05 ||
        Math.abs(this.vx[i]) > 0.05 ||
        Math.abs(this.vy[i]) > 0.05
      ) {
        active = true
      } else {
        this.ox[i] = 0
        this.oy[i] = 0
        this.vx[i] = 0
        this.vy[i] = 0
      }
    }

    this.animating = active
    return active
  }

  /** Draw the field. `time` is seconds. */
  render(time, { alpha = 1 } = {}) {
    const ctx = this.ctx
    const n = this.count
    ctx.clearRect(0, 0, this.width, this.height)
    if (!this.hasTargets || alpha <= 0) return

    const BUCKETS = 8
    // bucket -> array of coordinates [x1,y1,x2,y2,...]
    const solid = Array.from({ length: BUCKETS }, () => [])

    for (let i = 0; i < n; i++) {
      const len = this.bl[i]
      if (len <= 0.2) continue
      const s = this.seed[i]
      const driftX = Math.sin(time * 0.35 + s * TAU) * 0.9
      const driftY = Math.cos(time * 0.27 + s * TAU * 1.13) * 0.9
      const a = this.ba[i] + Math.sin(time * 0.2 + s * 20) * 0.0009
      const cx = this.bx[i] + this.ox[i] + driftX
      const cy = this.by[i] + this.oy[i] + driftY
      const half = len / 2
      const dx = Math.cos(a) * half
      const dy = Math.sin(a) * half
      const x1 = cx - dx
      const y1 = cy - dy
      const x2 = cx + dx
      const y2 = cy + dy
      if (
        (x1 < -40 && x2 < -40) ||
        (x1 > this.width + 40 && x2 > this.width + 40) ||
        (y1 < -40 && y2 < -40) ||
        (y1 > this.height + 40 && y2 > this.height + 40)
      ) {
        continue
      }
      const tone = clamp(this.bt[i], 0, 1)
      const bucket = clamp(Math.floor(tone * BUCKETS), 0, BUCKETS - 1)
      const arr = solid[bucket]
      arr.push(x1, y1, x2, y2)
    }

    ctx.lineCap = 'round'
    // ── Glow pass: a wide, faint stroke under everything ──
    ctx.globalCompositeOperation = 'lighter'
    for (let b = 0; b < BUCKETS; b++) {
      const arr = solid[b]
      if (arr.length === 0) continue
      const tone = (b + 0.5) / BUCKETS
      const [r, g, bl] = this.mixColor(tone)
      ctx.beginPath()
      for (let j = 0; j < arr.length; j += 4) {
        ctx.moveTo(arr[j], arr[j + 1])
        ctx.lineTo(arr[j + 2], arr[j + 3])
      }
      ctx.strokeStyle = `rgba(${r},${g},${bl},${(0.045 * alpha * (0.5 + tone * 0.8)).toFixed(3)})`
      ctx.lineWidth = 5.5
      ctx.stroke()
    }
    // ── Core pass ──
    for (let b = 0; b < BUCKETS; b++) {
      const arr = solid[b]
      if (arr.length === 0) continue
      const tone = (b + 0.5) / BUCKETS
      const [r, g, bl] = this.mixColor(tone)
      ctx.beginPath()
      for (let j = 0; j < arr.length; j += 4) {
        ctx.moveTo(arr[j], arr[j + 1])
        ctx.lineTo(arr[j + 2], arr[j + 3])
      }
      ctx.strokeStyle = `rgba(${r},${g},${bl},${(0.5 * alpha * (0.35 + tone * 0.75)).toFixed(3)})`
      ctx.lineWidth = 1.15
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  mixColor(tone) {
    const t = clamp(tone, 0, 1)
    return [
      Math.round(this.c1[0] + (this.c2[0] - this.c1[0]) * t),
      Math.round(this.c1[1] + (this.c2[1] - this.c1[1]) * t),
      Math.round(this.c1[2] + (this.c2[2] - this.c1[2]) * t),
    ]
  }
}
