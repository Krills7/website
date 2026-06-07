import { profile } from '../data/profile'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.greeting}>
          {profile.greeting}
        </p>
        <h1 className={styles.name}>
          {profile.name}
        </h1>
        <p className={styles.elevator}>
          {profile.elevator}
        </p>
        <p className={styles.tagline}>
          {profile.tagline}
        </p>
        <p className={styles.blurb}>
          {profile.about}
        </p>
        <div className={styles.ctas}>
          <a href="#projects" className={styles.ctaPrimary}>
            View Projects
          </a>
          <a href={`mailto:${profile.email}`} className={styles.ctaSecondary}>
            Get in Touch
          </a>
        </div>
        <div className={styles.social}>
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
