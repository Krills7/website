import { useState } from 'react'
import styles from './FiberMapFrame.module.css'

export default function FiberMapFrame() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={styles.wrapper}>
      {!loaded && (
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <span>Loading Phoenix Fiber Map...</span>
        </div>
      )}
      <iframe
        src="/phoenix_fiber_map_v3.html"
        className={styles.iframe}
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        title="Phoenix Fiber Build Map"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
