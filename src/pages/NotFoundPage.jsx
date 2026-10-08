import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.code}>error 404 — sector not found</p>
        <h1 className={styles.title}>This page has left the grid.</h1>
        <p className={styles.body}>
          The address resolved to empty space. The particles never made it here.
        </p>
        <div className={styles.actions}>
          <Link className="btn primary" to="/">
            return home
          </Link>
          <Link className="btn" to="/work">
            see the work
          </Link>
        </div>
      </div>
    </section>
  )
}
