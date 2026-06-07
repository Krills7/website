import CursorGlow from '../components/CursorGlow'
import HeroSection from '../components/HeroSection'
import ProjectCard from '../components/ProjectCard'
import { profile } from '../data/profile'
import styles from './HomePage.module.css'

export default function HomePage() {
  return (
    <>
      <CursorGlow />
      <HeroSection />

      <section id="about" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>About</h2>
          <p className={styles.aboutText}>{profile.about}</p>
        </div>
      </section>

      <section id="projects" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          <div className={styles.projects}>
            {profile.projects.map((project) => (
              <ProjectCard
                key={project.title}
                title={project.title}
                description={project.description}
                tags={project.tags}
                image={project.image}
                link={project.link}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
