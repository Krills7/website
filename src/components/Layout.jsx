import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import ResumeBanner from './ResumeBanner'
import Footer from './Footer'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Navigation />
      <main className={styles.main}>
        <Outlet />
      </main>
      <ResumeBanner />
      <Footer />
    </div>
  )
}
