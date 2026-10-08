import { useEffect, useRef } from 'react'
import styles from './ScrollBar.module.css'

/** Thin scroll-progress line pinned under the header. */
export default function ScrollBar() {
  const ref = useRef(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const doc = document.documentElement
      const max = Math.max(1, doc.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, window.scrollY / max))
      if (ref.current) ref.current.style.transform = `scaleX(${p})`
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={styles.track} aria-hidden="true">
      <i ref={ref} className={styles.fill} />
    </div>
  )
}
