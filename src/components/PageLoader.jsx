import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <span className={styles.text}>Loading...</span>
    </div>
  )
}
