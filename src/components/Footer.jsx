import { profile } from '../data/profile'
import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          &copy; {year} {profile.name}. Built with React + Vite.
        </p>
        <div className={styles.links}>
          <a
            href={profile.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub
          </a>
          <a
            href={profile.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`} className={styles.link}>
            Email
          </a>
        </div>
      </div>
    </footer>
  )
}
