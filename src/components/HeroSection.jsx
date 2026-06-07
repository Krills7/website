import { profile } from '../data/profile'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p
          className={styles.greeting}
          style={{ animationDelay: '0s' }}
        >
          {profile.greeting}
        </p>
        <h1
          className={styles.name}
          style={{ animationDelay: '0.15s' }}
        >
          {profile.name}
        </h1>
        <p
          className={styles.tagline}
          style={{ animationDelay: '0.3s' }}
        >
          {profile.tagline}
        </p>
        <p
          className={styles.elevator}
          style={{ animationDelay: '0.32s' }}
        >
          {profile.elevator}
        </p>
        <p
          className={styles.blurb}
          style={{ animationDelay: '0.35s' }}
        >
          {profile.about}
        </p>
        <div
          className={styles.ctas}
          style={{ animationDelay: '0.45s' }}
        >
          <a href="#projects" className={styles.ctaPrimary}>
            View Projects
          </a>
          <a href={`mailto:${profile.email}`} className={styles.ctaSecondary}>
            Get in Touch
          </a>
        </div>
        <div
          className={styles.social}
          style={{ animationDelay: '0.5s' }}
        >
          <a
            href={profile.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            GitHub
          </a>
          <a
            href={profile.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
