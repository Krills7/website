import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BootScreen from './BootScreen'
import CRTOverlay from './CRTOverlay'
import Footer from './Footer'
import Header from './Header'
import ParticleLayer from './ParticleLayer'
import ScrollBar from './ScrollBar'
import StatusBar from './StatusBar'
import styles from './Layout.module.css'

const CRT_KEY = 'db-crt'

export default function Layout() {
  const [crt, setCrt] = useState(() => {
    try {
      return localStorage.getItem(CRT_KEY) !== 'off'
    } catch {
      return true
    }
  })
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-crt', crt ? 'on' : 'off')
    try {
      localStorage.setItem(CRT_KEY, crt ? 'on' : 'off')
    } catch {
      /* ignore */
    }
  }, [crt])

  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        setCrt((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // SPA route changes should start at the top of the new page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="app">
      <a className={styles.skipLink} href="#content">
        skip to content
      </a>
      <ParticleLayer />
      <Header crt={crt} onToggleCrt={() => setCrt((v) => !v)} />
      <ScrollBar />
      <main id="content" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <StatusBar />
      <CRTOverlay enabled={crt} />
      <BootScreen />
    </div>
  )
}
