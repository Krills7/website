import { Link } from 'react-router-dom'
import ParticleZone from '../components/ParticleZone'
import Reveal from '../components/Reveal'
import { postboard } from '../data/postboard'
import styles from './PostBoardPage.module.css'

const BASE = import.meta.env.BASE_URL

const ICONS = {
  users: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19.5c.8-3.2 3.4-5.2 6.5-5.2s5.7 2 6.5 5.2" />
      <circle cx="17.5" cy="9.5" r="2.5" />
      <path d="M16.2 14.7c2.5.4 4.3 2 5 4.3" />
    </svg>
  ),
  posts: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10.5 13h6M10.5 17h4" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" />
      <path d="m13.5 7.5 3 3" />
      <path d="M4 20h16" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4v5h-5" />
    </svg>
  ),
  storage: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
}

export default function PostBoardPage() {
  return (
    <article className={styles.page}>
      {/* ── hero ─────────────────────────────────────────────── */}
      <header className={`shell ${styles.hero}`}>
        <ParticleZone
          id="postboard-title"
          text="POSTBOARD"
          font='700 140px "Space Grotesk", monospace'
          step={9}
          priority={2}
        />
        <Reveal as="p" className="eyebrow">
          {postboard.kicker}
        </Reveal>
        <Reveal as="h1" className={styles.title} delay={60}>
          PostBoard
        </Reveal>
        <Reveal as="p" className={styles.tagline} delay={120}>
          {postboard.tagline}
        </Reveal>
        <Reveal className={styles.actions} delay={180}>
          <a className="btn primary" href={`${BASE}${postboard.apk}`} download>
            download apk <span className="key">13 mb</span>
          </a>
          <a className="btn" href={postboard.github} target="_blank" rel="noreferrer">
            github <span aria-hidden="true">↗</span>
          </a>
        </Reveal>
        <Reveal as="p" className={styles.hint} delay={220}>
          {postboard.hint}
        </Reveal>
        <Reveal className={styles.meta} delay={260}>
          {postboard.meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </Reveal>
      </header>

      {/* ── demo ─────────────────────────────────────────────── */}
      <section className={`shell ${styles.demo}`}>
        <Reveal className={styles.phone}>
          <video autoPlay muted loop playsInline preload="metadata" poster={`${BASE}postboard/posts_list.png`}>
            <source src={`${BASE}postboard/demo.webm`} type="video/webm" />
            <source src={`${BASE}postboard/demo.mp4`} type="video/mp4" />
          </video>
        </Reveal>
        <Reveal className={styles.demoCopy} delay={100}>
          <h2 className={styles.sectionTitle}>The app</h2>
          <p>
            PostBoard is a deliberately small feature set implemented the way a production Android
            codebase would be: unidirectional data flow, dependency injection, offline-friendly
            persistence, and tests around the ViewModel. JSONPlaceholder does not really persist
            writes, so every change is recorded locally and merged over the API data — pull to
            refresh resets the demo.
          </p>
          <dl className={styles.facts}>
            <div>
              <dt>role</dt>
              <dd>{postboard.summary.role}</dd>
            </div>
            <div>
              <dt>stack</dt>
              <dd>{postboard.summary.stack}</dd>
            </div>
            <div>
              <dt>platform</dt>
              <dd>{postboard.summary.platform}</dd>
            </div>
            <div>
              <dt>tests</dt>
              <dd>{postboard.summary.tested}</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      {/* ── features ─────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <Reveal as="p" className="eyebrow">
            01 — features
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={60}>
            What it does
          </Reveal>
          <div className={styles.features}>
            {postboard.features.map((f, i) => (
              <Reveal key={f.title} className={styles.card} delay={i * 70}>
                <span className={styles.cardIcon}>{ICONS[f.icon]}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── screenshots ──────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <Reveal as="p" className="eyebrow">
            02 — screens
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={60}>
            Material 3, light and dark
          </Reveal>
          <div className={styles.shots}>
            {postboard.screenshots.map((s, i) => (
              <Reveal as="figure" key={s.caption} className={styles.shot} delay={i * 70}>
                <img src={`${BASE}${s.src}`} alt={s.alt} loading="lazy" />
                <figcaption>{s.caption}</figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── under the hood ───────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <Reveal as="p" className="eyebrow">
            03 — under the hood
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={60}>
            Modern Android, no shortcuts
          </Reveal>
          <Reveal className={styles.chips} delay={100}>
            {postboard.tech.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </Reveal>
          <div className={styles.columns}>
            <Reveal className={styles.column} delay={140}>
              <h3>Data flow</h3>
              <ul>
                {postboard.dataFlow.map((d) => (
                  <li key={d.lead}>
                    <strong>{d.lead}</strong> {d.body}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className={styles.column} delay={200}>
              <h3>Project layout</h3>
              <ul>
                {postboard.layout.map((l) => (
                  <li key={l.dir}>
                    <strong>{l.dir}</strong> — {l.body}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── cta ──────────────────────────────────────────────── */}
      <section className={`shell ${styles.cta}`}>
        <Reveal className={`panel ${styles.ctaPanel}`}>
          <p className={styles.ctaKicker}>// end of case study</p>
          <h2>Want the rest of the story?</h2>
          <p>
            The profile page covers the full log — Kotlin and Compose sit next to machine
            learning, full-stack work, and production operations.
          </p>
          <div className={styles.ctaActions}>
            <Link className="btn primary" to="/profile">
              read the profile
            </Link>
            <Link className="btn" to="/work">
              back to work
            </Link>
          </div>
        </Reveal>
      </section>
    </article>
  )
}
