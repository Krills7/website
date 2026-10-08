import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './BootScreen.module.css'

const LINES = [
  '[ ok ] power-on self test ................ pass',
  '[ ok ] db-os kernel ...................... v2.6',
  '[ ok ] particle.drv (canvas) ............. recycled pool: 1,250',
  '[ ok ] crt.drv (phosphor) ................ bloom ready',
  '[ ok ] leaflet.gis ....................... 3,500 permits indexed',
  '[ ok ] react.sys / vite.sys .............. compiled',
  '[ !! ] coffee.sys ........................ low',
  'mounting /home ........................... done',
  'ready.',
]

const BOOT_KEY = 'db-booted'

/**
 * A short CRT boot sequence, once per browser session. Skippable with any
 * key or click, and skipped entirely for reduced-motion users.
 */
export default function BootScreen() {
  const reduced = useReducedMotion()
  const shouldBoot = useMemo(() => {
    if (typeof window === 'undefined') return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try {
      return sessionStorage.getItem(BOOT_KEY) !== '1'
    } catch {
      return true
    }
  }, [])
  const [visible, setVisible] = useState(shouldBoot)
  const [shown, setShown] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!visible || reduced) return
    try {
      sessionStorage.setItem(BOOT_KEY, '1')
    } catch {
      /* ignore */
    }
    let i = 0
    const tick = setInterval(() => {
      i += 1
      setShown(i)
      if (i >= LINES.length) clearInterval(tick)
    }, 130)
    return () => clearInterval(tick)
  }, [visible, reduced])

  useEffect(() => {
    if (!visible) return
    const skip = () => {
      setLeaving(true)
      window.setTimeout(() => setVisible(false), 260)
    }
    const timer = window.setTimeout(skip, 1500 + LINES.length * 130)
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`${styles.boot} ${leaving ? styles.leaving : ''}`} role="presentation">
      <div className={styles.inner}>
        <div className={styles.head}>
          <span className={styles.logo}>DB-OS</span>
          <span className={styles.sub}>phoenix, az — software engineer</span>
        </div>
        <div className={styles.log}>
          {LINES.slice(0, shown).map((line) => (
            <p key={line} className={line.includes('[ !! ]') ? styles.warn : undefined}>
              {line}
            </p>
          ))}
          {shown < LINES.length && <span className={styles.cursor} />}
        </div>
        <div className={styles.bar}>
          <i style={{ width: `${Math.min(100, (shown / LINES.length) * 100)}%` }} />
        </div>
        <button type="button" className={styles.skip} onClick={() => setLeaving(true)}>
          press any key to skip
        </button>
      </div>
    </div>
  )
}
