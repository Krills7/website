import { profile } from '../data/profile'
import styles from './ResumeBanner.module.css'

export default function ResumeBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.inner}>
        <p className={styles.text}>Want the full picture? Download my resume.</p>
        <a
          href="/DavidBrimhallRESUME2026.docx"
          download
          className={styles.link}
        >
          Download Resume
        </a>
      </div>
    </section>
  )
}
