import FiberMapFrame from '../components/FiberMapFrame'
import styles from './FiberMapPage.module.css'

export default function FiberMapPage() {
  return (
    <div className={styles.page}>
      <div className={styles.blurb}>
        <p>
          Waiting for fiber internet? View permits issued to telecom companies
          through the city of Phoenix to see if there's activity in your neighborhood!
        </p>
      </div>
      <FiberMapFrame />
    </div>
  )
}
