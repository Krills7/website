import { useEffect, useMemo, useRef, useState } from 'react'
import { profile } from '../data/profile'
import {
  Wire,
  geodesic,
  makeCamera,
  range,
  renderDynamic,
  renderWire,
  smooth,
  window01,
} from '../engine/wire3d'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useScrollProgress } from '../hooks/useScrollProgress'
import styles from './WorkflowVisual.module.css'

const CHAPTERS = profile.workflow

const scalePt = (v, s, c = [0, 0, 0]) => [
  c[0] + v[0] * s,
  c[1] + v[1] * s,
  c[2] + v[2] * s,
]

// ─────────────────────────────────────────────────────────────────
// Scene 1 — EXPLORE: sources converge on a question core.
// ─────────────────────────────────────────────────────────────────
const SOURCES = Array.from({ length: 7 }, (_, i) => {
  const a = -2.35 + (i / 6) * 4.7
  return [Math.cos(a) * 560, 170 + Math.sin(a * 1.35) * 120, Math.sin(i * 1.7) * 150]
})
const CORE = [0, -20, 0]

function buildExplore() {
  const wire = new Wire()
  wire.use({ tone: 0.5, group: 'x.sources' })
  for (const s of SOURCES) {
    const w = 42
    const h = 54
    wire.box([s[0] - w / 2, s[1] - h / 2, s[2] - 7], [s[0] + w / 2, s[1] + h / 2, s[2] + 7])
    wire.seg([s[0] - w / 2 + 8, s[1] + 13, s[2] + 8], [s[0] + w / 2 - 8, s[1] + 13, s[2] + 8])
    wire.seg([s[0] - w / 2 + 8, s[1] - 1, s[2] + 8], [s[0] + w / 2 - 8, s[1] - 1, s[2] + 8])
  }

  wire.use({ tone: 0.55, group: 'x.streams', dash: [6, 10], flow: 1 })
  for (const s of SOURCES) wire.seg(s, CORE)

  wire.use({ tone: 0.72, width: 1.2, group: 'x.core' })
  for (const [a, b] of geodesic(1)) {
    wire.seg(scalePt(a, 128, CORE), scalePt(b, 128, CORE))
  }
  wire.use({ tone: 0.42, group: 'x.orbit' })
  wire.ring(CORE, 208, { u: [1, 0, 0], v: [0, 0, 1], segments: 52 })
  wire.ring(CORE, 248, { u: [0.94, 0, 0.34], v: [0, 1, 0], segments: 52 })

  wire.label([SOURCES[0][0], SOURCES[0][1] + 46, SOURCES[0][2]], 'SOURCES', 'docs · data · tickets · logs', {
    side: -1,
    fade: [0.03, 0.08, 0.18, 0.26],
  })
  wire.label([CORE[0], CORE[1] - 148, CORE[2]], 'THE QUESTION', 'what does the system actually need?', {
    side: 1,
    fade: [0.10, 0.16, 0.24, 0.31],
  })
  return wire
}

function dynamicExplore(p, t, out) {
  const scan = window01(p, 0.04, 0.1, 0.28, 0.34)
  if (scan > 0.01) {
    const y = -250 + smooth(range(p, 0.06, 0.3)) * 440
    const rad = 330
    let prev = null
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2
      const pt = [Math.cos(a) * rad, y + Math.sin(a * 2) * 10, Math.sin(a) * rad]
      if (prev) out.push({ a: prev, b: pt, tone: 0.85, alpha: scan * 0.4 })
      prev = pt
    }
    out.push({ a: [0, y, 0], b: [0, y + 140, 0], tone: 0.8, alpha: scan * 0.6 })
  }

  const flow = window01(p, 0.07, 0.12, 0.28, 0.34)
  if (flow > 0.01) {
    for (let i = 0; i < SOURCES.length; i++) {
      const s = SOURCES[i]
      const k = (t * 0.22 + i / SOURCES.length) % 1
      const x = s[0] + (CORE[0] - s[0]) * k
      const y = s[1] + (CORE[1] - s[1]) * k
      const z = s[2] + (CORE[2] - s[2]) * k
      out.push({
        a: [x - 9, y, z],
        b: [x + 9, y, z],
        tone: 1,
        alpha: flow * (1 - k) * 0.9,
        width: 1.6,
      })
    }
    for (let k = 0; k < 2; k++) {
      const kk = (t * 0.32 + k / 2) % 1
      const r = 128 + kk * 230
      const a0 = kk * Math.PI * 2
      out.push({
        a: [Math.cos(a0) * r, CORE[1], Math.sin(a0) * r],
        b: [Math.cos(a0 + 2.5) * r, CORE[1], Math.sin(a0 + 2.5) * r],
        tone: 0.9,
        alpha: flow * (1 - kk) * 0.5,
      })
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Scene 2 — BUILD: a layered system assembles, rings spin up, tests pass.
// ─────────────────────────────────────────────────────────────────
const SLAB_Y = [-150, -66, 18, 102]

function buildBuild() {
  const wire = new Wire()
  wire.use({ tone: 0.42, group: 'b.base' })
  wire.box([-340, -216, -205], [340, -196, 205])

  wire.use({ tone: 0.35, group: 'b.posts' })
  for (const [x, z] of [[-250, -150], [250, -150], [250, 150], [-250, 150]]) {
    wire.seg([x, -196, z], [x, 109, z])
  }

  SLAB_Y.forEach((y, i) => {
    wire.use({ tone: 0.62, width: 1.15, group: `b.slab${i}` })
    wire.box([-250, y - 7, -150], [250, y + 7, 150])
    wire.use({ tone: 0.35, group: `b.slab${i}` })
    wire.ring([0, y, 0], 252, { u: [1, 0, 0], v: [0, 0, 1], segments: 48 })
  })

  wire.use({ tone: 0.55, width: 1.1, group: 'b.rings' })
  wire.ring([0, -24, 0], 300, { u: [1, 0, 0], v: [0, 0, 1], segments: 56 })
  wire.ring([0, -24, 0], 340, { u: [0.94, 0, 0.34], v: [0, 1, 0], segments: 56 })
  wire.ring([0, -24, 0], 380, { u: [0.34, 0, -0.94], v: [0, 0.6, 0.8], segments: 56 })

  wire.use({ tone: 0.4, group: 'b.tests' })
  wire.box([480, -220, -10], [700, 150, 10])
  wire.use({ tone: 0.5, group: 'b.tests' })
  for (let i = 0; i < 6; i++) {
    const y = 120 - i * 52
    wire.seg([540, y, 0], [660, y, 0])
  }

  wire.use({ tone: 0.45, group: 'b.beam' })
  wire.seg([0, -196, 0], [0, 210, 0])

  wire.label([-250, 130, -150], 'LAYERS', 'data · logic · interface', {
    side: -1,
    fade: [0.38, 0.45, 0.56, 0.64],
  })
  wire.label([0, -24, 380], 'THE LOOP', 'build · measure · refine', {
    side: 1,
    lift: 40,
    fade: [0.44, 0.5, 0.58, 0.66],
  })
  wire.label([700, 150, 0], 'PROOF', 'each step verifiable', {
    side: 1,
    lift: -10,
    fade: [0.5, 0.56, 0.62, 0.69],
  })
  return wire
}

function dynamicBuild(p, t, out) {
  const beam = window01(p, 0.4, 0.45, 0.63, 0.69)
  if (beam > 0.01) {
    const k = (t * 0.55) % 1
    const y = -196 + k * 400
    out.push({ a: [0, y, 0], b: [0, y + 26, 0], tone: 1, alpha: beam, width: 1.8 })
  }

  const rings = window01(p, 0.42, 0.47, 0.63, 0.69)
  if (rings > 0.01) {
    const radii = [300, 340, 380]
    for (let k = 0; k < 3; k++) {
      const a = t * (0.45 + k * 0.3) + k * 2.1
      const r = radii[k]
      const pt = [Math.cos(a) * r, -24 + Math.sin(a * 2) * 26, Math.sin(a) * r]
      out.push({ a: pt, b: [pt[0], pt[1] - 18, pt[2]], tone: 0.95, alpha: rings * 0.9, width: 1.5 })
    }
  }

  const tests = window01(p, 0.47, 0.53, 0.63, 0.69)
  if (tests > 0.01) {
    for (let i = 0; i < 6; i++) {
      const on = smooth(range(p, 0.49 + i * 0.022, 0.525 + i * 0.022))
      if (on <= 0.01) continue
      const y = 120 - i * 52
      out.push({ a: [522, y, 0], b: [534, y - 14, 0], tone: 1, alpha: tests * on })
      out.push({ a: [534, y - 14, 0], b: [552, y + 8, 0], tone: 1, alpha: tests * on })
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Scene 3 — OPERATE: the system docks, reports, and locks down.
// ─────────────────────────────────────────────────────────────────
function buildOperate() {
  const wire = new Wire()
  wire.use({ tone: 0.5, width: 1.1, group: 'o.rack' })
  wire.box([-300, -240, -150], [300, 270, 150])
  wire.use({ tone: 0.32, group: 'o.rack' })
  for (let i = 0; i < 5; i++) {
    const y = 210 - i * 100
    wire.seg([-300, y, -150], [300, y, -150])
  }

  wire.use({ tone: 0.6, width: 1.1, group: 'o.dock' })
  for (const y of [-150, -66, 18, 102]) {
    wire.box([-210, y - 7, -120], [210, y + 7, 120])
  }

  wire.use({ tone: 0.42, group: 'o.waves' })
  wire.box([-360, -430, 238], [360, -226, 250])
  wire.seg([-330, -330, 254], [330, -330, 254], { tone: 0.6 })

  wire.use({ tone: 0.58, group: 'o.links', dash: [5, 9], flow: 1 })
  for (const y of [0, 40, 90]) {
    wire.seg([300, y, 0], [360, -320, 244])
  }

  wire.use({ tone: 0.78, width: 1.3, group: 'o.shield' })
  const hex = []
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    hex.push([Math.cos(a) * 235, 10 + Math.sin(a) * 235, 170])
  }
  wire.poly(hex, {})
  wire.seg(hex[5], hex[0])
  wire.use({ tone: 0.8, group: 'o.shield' })
  wire.box([-34, -14, 170], [34, 48, 170])
  wire.ring([0, 58, 170], 24, { from: Math.PI, to: Math.PI * 2, segments: 22 })

  wire.label([-300, 270, -150], 'PRODUCTION', 'deploy · monitor · maintain', {
    side: -1,
    fade: [0.7, 0.76, 0.84, 0.92],
  })
  wire.label([340, -430, 244], 'TELEMETRY', 'alerts · logs · dashboards', {
    side: 1,
    lift: -12,
    fade: [0.78, 0.84, 0.92, 1.05],
  })
  wire.label([160, 245, 170], 'GUARDRAILS', 'regulated data · least access', {
    side: 1,
    lift: 30,
    fade: [0.86, 0.91, 1.02, 1.2],
  })
  return wire
}

function dynamicOperate(p, t, out) {
  const waves = window01(p, 0.74, 0.8, 1.2, 1.3)
  if (waves > 0.01) {
    for (let k = 0; k < 2; k++) {
      const y0 = -300 - k * 48
      let prev = null
      for (let i = 0; i <= 44; i++) {
        const tt = i / 44
        const pt = [
          -330 + tt * 660,
          y0 + Math.sin(tt * Math.PI * 6 + t * (1.1 + k * 0.45)) * 16,
          252,
        ]
        if (prev) out.push({ a: prev, b: pt, tone: k ? 0.6 : 0.9, alpha: waves * 0.65 })
        prev = pt
      }
    }
  }

  const pulse = window01(p, 0.78, 0.84, 1.2, 1.3)
  if (pulse > 0.01) {
    for (let k = 0; k < 2; k++) {
      const kk = (t * 0.28 + k / 2) % 1
      const r = 320 + kk * 260
      const a0 = kk * Math.PI * 2
      out.push({
        a: [Math.cos(a0) * r, 10, Math.sin(a0) * r],
        b: [Math.cos(a0 + 2.6) * r, 10, Math.sin(a0 + 2.6) * r],
        tone: 0.85,
        alpha: pulse * (1 - kk) * 0.45,
      })
    }
  }

  const dock = range(p, 0.7, 0.79)
  if (dock > 0 && dock < 1) {
    const ease = smooth(dock)
    const off = (1 - ease) * 720
    const corners = [
      [-210, -195],
      [210, -195],
      [210, 60],
      [-210, 60],
    ].map(([x, y]) => [x + off, y, 0])
    for (let i = 0; i < 4; i++) {
      out.push({
        a: corners[i],
        b: corners[(i + 1) % 4],
        tone: 0.95,
        alpha: Math.sin(Math.PI * dock) * 1.2,
        width: 1.5,
      })
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Timeline: which groups are lit at a given scroll progress.
// window values are [fadeIn start, fadeIn end, fadeOut start, fadeOut end].
// ─────────────────────────────────────────────────────────────────
const TRACKS = {
  'x.sources': [0.0, 0.05, 0.3, 0.37],
  'x.streams': [0.03, 0.08, 0.3, 0.37],
  'x.core': [0.05, 0.1, 0.31, 0.38],
  'x.orbit': [0.07, 0.12, 0.3, 0.37],
  'b.base': [0.32, 0.38, 0.64, 0.71],
  'b.posts': [0.35, 0.41, 0.64, 0.71],
  'b.slab0': [0.34, 0.4, 0.64, 0.71],
  'b.slab1': [0.36, 0.42, 0.64, 0.71],
  'b.slab2': [0.38, 0.44, 0.64, 0.71],
  'b.slab3': [0.4, 0.46, 0.64, 0.71],
  'b.rings': [0.43, 0.49, 0.64, 0.71],
  'b.tests': [0.47, 0.53, 0.64, 0.71],
  'b.beam': [0.41, 0.47, 0.64, 0.71],
  'o.rack': [0.65, 0.72, 1.3, 1.4],
  'o.dock': [0.7, 0.77, 1.3, 1.4],
  'o.waves': [0.74, 0.81, 1.3, 1.4],
  'o.links': [0.77, 0.84, 1.3, 1.4],
  'o.shield': [0.84, 0.9, 1.3, 1.4],
}

function computeLit(p) {
  const lit = {}
  for (const key of Object.keys(TRACKS)) {
    lit[key] = window01(p, ...TRACKS[key])
  }
  return lit
}

const CAMS = [
  { yaw: 0.38, pitch: 0.24, target: [0, -30, 0], dist: 2300 },
  { yaw: -0.28, pitch: 0.34, target: [40, -40, 0], dist: 2360 },
  { yaw: 0.5, pitch: 0.2, target: [0, -20, 0], dist: 2280 },
]

function camAt(p) {
  const t = Math.min(1.999, p * 2)
  const i = Math.floor(t)
  const f = smooth(t - i)
  const a = CAMS[i]
  const b = CAMS[i + 1] ?? CAMS[i]
  return {
    yaw: a.yaw + (b.yaw - a.yaw) * f,
    pitch: a.pitch + (b.pitch - a.pitch) * f,
    dist: a.dist + (b.dist - a.dist) * f,
    target: [
      a.target[0] + (b.target[0] - a.target[0]) * f,
      a.target[1] + (b.target[1] - a.target[1]) * f,
      a.target[2] + (b.target[2] - a.target[2]) * f,
    ],
  }
}

export default function WorkflowVisual() {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const canvasRef = useRef(null)
  const barRef = useRef(null)
  const progressRef = useRef(0)
  const drawRef = useRef(null)
  const [chapter, setChapter] = useState(0)
  const reduced = useReducedMotion()

  const wire = useMemo(() => {
    const explore = buildExplore()
    const build = buildBuild()
    const operate = buildOperate()
    return {
      segments: [...explore.segments, ...build.segments, ...operate.segments],
      labels: [...explore.labels, ...build.labels, ...operate.labels],
    }
  }, [])

  useScrollProgress(sectionRef, (p) => {
    progressRef.current = p
    const ch = p < 0.33 ? 0 : p < 0.7 ? 1 : 2
    setChapter((prev) => (prev === ch ? prev : ch))
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    if (reduced) drawRef.current?.(performance.now(), p)
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const sticky = stickyRef.current
    if (!canvas || !sticky) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 1
    let h = 1
    let cam = null
    let raf = 0
    let running = true
    let inView = false

    const min2 = (a, b) => Math.min(a, b)

    const resize = () => {
      const rect = sticky.getBoundingClientRect()
      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const minDim = Math.min(w, h)
      cam = makeCamera(
        { x: 0, y: 0, width: w, height: h },
        { dist: 2300, fov: Math.max(640, Math.min(1900, minDim * 1.9)) },
      )
    }

    const drawFrame = (now) => {
      const p = progressRef.current
      const t = reduced ? 0 : now / 1000
      const conf = camAt(p)
      cam.yaw = conf.yaw + Math.sin(t * 0.06) * 0.04
      cam.pitch = conf.pitch
      cam.dist = conf.dist
      cam.target = conf.target

      ctx.clearRect(0, 0, w, h)
      const lit = computeLit(p)
      const out = []
      dynamicExplore(p, t, out)
      dynamicBuild(p, t, out)
      dynamicOperate(p, t, out)
      renderDynamic(ctx, cam, out, { time: t })
      renderWire(ctx, wire, cam, { lit, p }, { time: t, width: w, height: h })

      // A quiet vignette so the wireframe sits inside the tube.
      const grad = ctx.createRadialGradient(w / 2, h / 2, min2(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7)
      grad.addColorStop(0, 'rgba(4,7,10,0)')
      grad.addColorStop(1, 'rgba(4,7,10,0.55)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }

    const loop = (now) => {
      if (!running) return
      raf = requestAnimationFrame(loop)
      if (!inView || document.hidden) return
      drawFrame(now)
    }

    resize()
    drawRef.current = drawFrame

    const onResize = () => {
      resize()
      drawFrame(performance.now())
    }
    window.addEventListener('resize', onResize)

    // Only burn frames while the canvas can actually be seen.
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
    })
    io.observe(sticky)

    if (reduced) {
      drawFrame(performance.now())
    } else {
      raf = requestAnimationFrame(loop)
    }

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      drawRef.current = null
    }
  }, [wire, reduced])

  const goTo = (i) => {
    const section = sectionRef.current
    if (!section) return
    const rect = section.getBoundingClientRect()
    const top = window.scrollY + rect.top
    const scrollable = Math.max(1, rect.height - window.innerHeight)
    window.scrollTo({ top: top + (i / 2) * scrollable, behavior: 'smooth' })
  }

  return (
    <section className={styles.workflow} ref={sectionRef} aria-label="How I work">
      <div className={styles.sticky} ref={stickyRef}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.hud} aria-hidden="true">
          <div className={styles.hudLeft}>
            <span className={styles.hudNum}>{CHAPTERS[chapter].num}</span>
            <span className={styles.hudStage}>{CHAPTERS[chapter].stage}</span>
          </div>
          <div className={styles.hudCaption}>{CHAPTERS[chapter].caption}</div>
        </div>
        <div className={styles.rail} role="tablist" aria-label="Workflow phases">
          <div className={styles.railTrack}>
            <i ref={barRef} className={styles.railFill} />
          </div>
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={chapter === i}
              className={`${styles.railDot} ${chapter === i ? styles.railActive : ''}`}
              onClick={() => goTo(i)}
            >
              <span className={styles.dot} />
              {c.num} {c.id}
            </button>
          ))}
        </div>
        <p className={styles.scrollHint} aria-hidden="true">
          keep scrolling ↓
        </p>
      </div>

      <div className={styles.panels}>
        {CHAPTERS.map((c, i) => (
          <article key={c.id} className={styles.panel} id={`workflow-${c.id}`}>
            <div className={styles.card} data-side={i % 2 === 0 ? 'left' : 'right'}>
              <p className={styles.cardKicker}>
                {c.num} / {c.file}
              </p>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardBody}>{c.body}</p>
              <ul className={styles.proof}>
                {c.proof.map((pr) => (
                  <li key={pr}>{pr}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
