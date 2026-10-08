import { Link } from 'react-router-dom'
import { profile } from '../data/profile'
import Reveal from './Reveal'
import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.cta}`}>
        <Reveal className={styles.ctaInner}>
          <p className={styles.kicker}>// signal accepted</p>
          <h2 className={styles.title}>
            Have a problem worth <em>building</em> around?
          </h2>
          <p className={styles.body}>
            I&apos;m looking for a software engineering team where I can build tools that solve real
            problems. Tell me what you&apos;re working on.
          </p>
          <div className={styles.actions}>
            <a className="btn primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a className="btn" href={profile.resume} download>
              résumé.docx <span className="key">dl</span>
            </a>
          </div>
        </Reveal>
      </div>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className={styles.marqueeContent}>
              available for software engineering roles · phoenix, az · react · python · ml ·
              fiber maps ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className={`shell ${styles.bottom}`}>
        <p>
          © {year} {profile.name} · built from scratch with React + Canvas
        </p>
        <nav className={styles.links} aria-label="Elsewhere">
          <a href={profile.social.github} target="_blank" rel="noreferrer">
            github
          </a>
          <a href={profile.social.linkedin} target="_blank" rel="noreferrer">
            linkedin
          </a>
          <a href={`mailto:${profile.email}`}>email</a>
          <Link to="/fiber-map">fiber map</Link>
        </nav>
      </div>
    </footer>
  )
}
