import ProjectCard from '../components/ProjectCard'
import ParticleZone from '../components/ParticleZone'
import Reveal from '../components/Reveal'
import { profile } from '../data/profile'
import styles from './WorkPage.module.css'

export default function WorkPage() {
  return (
    <section className={styles.page}>
      <div className="shell">
        <div className={styles.head}>
          <ParticleZone
            id="work-title"
            text="WORK.VOL"
            font='700 130px "Space Grotesk", monospace'
            step={9}
            priority={2}
          />
          <Reveal as="p" className="eyebrow">
            work.vol — the index
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            Projects that left the lab
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            A short list on purpose: everything here is something I designed, built, and kept
            alive. The fiber map is the largest; the others are the machinery behind this site.
          </Reveal>
        </div>

        <div className={styles.grid}>
          {profile.projects.map((project, i) => (
            <Reveal
              key={project.slug}
              className={project.featured ? styles.featuredWrap : undefined}
              delay={i * 90}
            >
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.footnote} delay={120}>
          <span aria-hidden="true">//</span> more experiments live on{' '}
          <a href={profile.social.github} target="_blank" rel="noreferrer">
            github.com/Krills7
          </a>
        </Reveal>
      </div>
    </section>
  )
}
