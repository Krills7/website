import { NavLink } from 'react-router-dom'
import { profile } from '../data/profile'
import styles from './Navigation.module.css'

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.name}>{profile.name}</span>
        </div>
        <ul className={styles.tabs}>
          {profile.nav.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `${styles.tab} ${isActive ? styles.active : ''}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
