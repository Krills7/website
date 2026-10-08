import { useState } from 'react'
import styles from './FiberMapFrame.module.css'

/**
 * The Phoenix fiber map is a self-contained Leaflet document in /public.
 * It is loaded in an iframe so its styles and scripts stay isolated from
 * the rest of the app — and so the whole tab can stay GPU-cheap while the
 * map does its own thing.
 */
export default function FiberMapFrame() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={styles.frame}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.lights}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.path}>/website/phoenix_fiber_map_v4_standalone.html</span>
        <span className={styles.live}>
          {loaded ? 'live' : 'loading'}
          <i className={loaded ? styles.liveDot : styles.loadDot} />
        </span>
      </div>
      <div className={styles.body}>
        {!loaded && (
          <div className={styles.loader}>
            <div className={styles.spinner} />
            <span>booting leaflet.gis …</span>
          </div>
        )}
        <iframe
          src={`${import.meta.env.BASE_URL}phoenix_fiber_map_v4_standalone.html`}
          className={styles.iframe}
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          title="Phoenix Fiber Build Map"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
