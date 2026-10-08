import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { profile } from '../data/profile'
import styles from './Header.module.css'

function Clock() {
  const [now, setNow] = useState('--:--')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Phoenix',
    })
    const tick = () => setNow(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 20_000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={styles.clock} title="Phoenix, Arizona time">
      {now} <em>MST</em>
    </span>
  )
}

export default function Header({ crt, onToggleCrt }) {
  const location = useLocation()
  const [menu, setMenu] = useState({ open: false, path: location.pathname })
  const open = menu.open && menu.path === location.pathname
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    // Close the mobile menu when the user starts scrolling.
    const close = () => setMenu((m) => ({ ...m, open: false }))
    window.addEventListener('scroll', close, { passive: true, once: true })
    return () => window.removeEventListener('scroll', close)
  }, [open])

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link to="/" className={styles.brand} aria-label="DB-OS home">
          <span className={styles.brandText}>DB-OS</span>
          <span className={styles.brandCaret} aria-hidden="true" />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {profile.nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.linkLabel}>{item.label}</span>
              <span className={styles.linkFile}>{item.file}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.tools}>
          <Clock />
          <button
            type="button"
            className={styles.tool}
            onClick={onToggleCrt}
            aria-pressed={crt}
            title="Toggle the cathode ray tube"
          >
            crt:{crt ? 'on' : 'off'}
          </button>
          <a className={`${styles.tool} ${styles.contact}`} href={`mailto:${profile.email}`}>
            contact
          </a>
        </div>

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setMenu({ open: !open, path: location.pathname })}
        >
          {open ? 'close' : 'menu'}
        </button>
      </div>

      <div className={`${styles.mobilePanel} ${open ? styles.mobileOpen : ''}`}>
        {profile.nav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`}
          >
            <span>{item.label}</span>
            <em>{item.file}</em>
          </NavLink>
        ))}
        <a className={styles.mobileLink} href={`mailto:${profile.email}`}>
          <span>contact</span>
          <em>mailto</em>
        </a>
      </div>
    </header>
  )
}
