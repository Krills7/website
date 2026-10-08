import FiberMapFrame from '../components/FiberMapFrame'
import Reveal from '../components/Reveal'
import styles from './FiberMapPage.module.css'

export default function FiberMapPage() {
  return (
    <section className={styles.page}>
      <header className={`shell ${styles.head}`}>
        <Reveal as="p" className="eyebrow">
          fiber.gis — live tool
        </Reveal>
        <Reveal as="h1" className={styles.title} delay={60}>
          Phoenix Fiber Build Map
        </Reveal>
        <Reveal as="p" className={styles.lead} delay={120}>
          Waiting for fiber internet? View permits issued to telecom companies through the city of
          Phoenix to see if there&apos;s activity in your neighborhood. 3,500+ active right-of-way
          construction permits, real-time search, and status filtering — all in the browser.
        </Reveal>
        <Reveal className={styles.meta} delay={180}>
          <span>leaflet · openstreetmap</span>
          <span>city of phoenix open data</span>
          <span>updated regularly</span>
        </Reveal>
      </header>
      <FiberMapFrame />
    </section>
  )
}
