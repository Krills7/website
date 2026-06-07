import { useNavigate } from 'react-router-dom'
import styles from './ProjectCard.module.css'

export default function ProjectCard({ title, description, tags, image, link }) {
  const navigate = useNavigate()

  function handleClick() {
    if (link.startsWith('/')) {
      navigate(link)
    } else {
      window.open(link, '_blank', 'noopener noreferrer')
    }
  }

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View project: ${title}`}
    >
      <div className={styles.imageWrap}>
        {image ? (
          <img src={image} alt={`${title} screenshot`} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>&#x25A0;</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
