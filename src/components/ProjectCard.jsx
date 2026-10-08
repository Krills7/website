import { Link } from 'react-router-dom'
import styles from './ProjectCard.module.css'

export default function ProjectCard({ project, index = 0 }) {
  const isInternal = project.link?.startsWith('/')
  const tags = (
    <ul className={styles.tags}>
      {project.tags.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )

  const body = (
    <>
      <header className={styles.head}>
        <span className={styles.figure}>{String(index + 1).padStart(2, '0')}</span>
        <span className={styles.file}>{project.file}</span>
        {project.featured && <span className={styles.badge}>featured</span>}
      </header>
      <h3 className={styles.title}>{project.title}</h3>
      <p className={styles.tagline}>{project.tagline}</p>
      <p className={styles.desc}>{project.description}</p>
      {tags}
      <span className={styles.cta}>
        {project.cta ?? 'Open'} <span aria-hidden="true">▸</span>
      </span>
    </>
  )

  return isInternal ? (
    <Link to={project.link} className={`${styles.card} ${project.featured ? styles.featured : ''}`}>
      {body}
    </Link>
  ) : (
    <a
      href={project.link}
      className={`${styles.card} ${project.featured ? styles.featured : ''}`}
      target="_blank"
      rel="noreferrer"
    >
      {body}
    </a>
  )
}
