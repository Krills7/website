import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { profile } from '../data/profile'
import styles from './StatusBar.module.css'

const HINTS = {
  '/': 'scroll to recycle the particles',
  '/profile': 'the wireframe below reacts to your scroll',
  '/work': 'every card opens a door',
  '/fiber-map': 'drag the map · filter by status',
  '/visual': 'move the cursor · click to fire a wave',
}

export default function StatusBar() {
  const location = useLocation()
  const path = location.pathname.replace(/\/$/, '') || '/'
  const file = profile.nav.find((n) => n.path === path)?.file ?? 'home.sys'
  const pctRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const doc = document.documentElement
      const max = Math.max(1, doc.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, window.scrollY / max))
      if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <footer className={styles.bar}>
      <span className={styles.cell}>
        <span className={styles.prompt}>~/</span>
        <span className={styles.path}>{path === '/' ? 'home' : path.slice(1)}</span>
        <span className={styles.file}>{file}</span>
      </span>
      <span className={`${styles.cell} ${styles.hint}`}>{HINTS[path] ?? 'db-os v2.6'}</span>
      <span className={styles.cell}>
        <span className={styles.scrollLabel}>scroll</span>
        <b ref={pctRef}>000</b>%
      </span>
    </footer>
  )
}
