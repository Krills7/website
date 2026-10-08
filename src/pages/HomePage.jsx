import { Link } from 'react-router-dom'
import ParticleZone from '../components/ParticleZone'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import { profile } from '../data/profile'
import styles from './HomePage.module.css'

const TERMINAL_LINES = [
  { cmd: 'whoami', out: 'david_brimhall — software engineer' },
  { cmd: 'cat location.txt', out: 'phoenix, arizona · UTC-7' },
  {
    cmd: 'cat focus.txt',
    out: 'machine learning · full-stack · production systems',
  },
  { cmd: 'ls ./currently', out: 'analyst @ resilient health' },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Reveal as="p" className={styles.kicker}>
            // software engineer — phoenix, az
          </Reveal>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroName}>
              <span className="glitch">{profile.name}</span>
            </span>
            <ParticleZone id="home-name" text="David Brimhall" wrap step={9} priority={2} />
          </h1>
          <Reveal as="p" className={styles.heroLead} delay={120}>
            {profile.elevator}
          </Reveal>
          <Reveal className={styles.heroActions} delay={240}>
            <Link className="btn primary" to="/work">
              view work
            </Link>
            <Link className="btn" to="/profile">
              read profile
            </Link>
            <a className="btn" href={profile.resume} download>
              résumé <span className="key">docx</span>
            </a>          </Reveal>
          <Reveal className={styles.stats} delay={360}>
            {profile.stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </Reveal>
        </div>
        <div className={styles.scrollCue} aria-hidden="true">
          <span>scroll</span>
          <i />
        </div>
      </section>

      {/* ── whoami ───────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <Reveal as="p" className="eyebrow">
            01 — whoami
          </Reveal>
          <div className={styles.aboutGrid}>
            <ParticleZone id="home-about" kind="network" />
            <Reveal className={styles.terminal} delay={80}>
            <div className={styles.terminalBar}>
              <span />
              <span />
              <span />
              <em>david@phoenix:~$</em>
            </div>
            <div className={styles.terminalBody}>
              {TERMINAL_LINES.map((line) => (
                <div key={line.cmd} className={styles.termLine}>
                  <p className={styles.termCmd}>
                    <span aria-hidden="true">$</span> {line.cmd}
                  </p>
                  <p className={styles.termOut}>{line.out}</p>
                </div>
              ))}
              <p className={styles.termCmd}>
                <span aria-hidden="true">$</span> <i className="caret" />
              </p>
            </div>
          </Reveal>

          <div className={styles.aboutCopy}>
            <Reveal as="p" className={styles.aboutText} delay={120}>
              {profile.about}
            </Reveal>
            <ul className={styles.roleList}>
              {profile.roles.map((role, i) => (
                <Reveal as="li" key={role.id} delay={160 + i * 80}>
                  <span className={styles.roleNum}>{role.num}</span>
                  <div>
                    <h3 className={styles.roleTitle}>
                      {role.title} <em>{role.file}</em>
                    </h3>
                    <p className={styles.roleBlurb}>{role.blurb}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
          </div>
        </div>
      </section>

      {/* ── selected work ────────────────────────────────────── */}
      <section className="section" id="work">
        <div className="shell">
          <ParticleZone id="home-work" kind="grid" />
          <Reveal as="p" className="eyebrow">
            02 — selected work
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={60}>
            Things I&apos;ve built and shipped
          </Reveal>
          <div className={styles.projectGrid}>
            {profile.projects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 100} className={project.featured ? styles.featuredWrap : undefined}>
                <ProjectCard project={project} index={i} />
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.workMore} delay={120}>
            <Link to="/work" className={styles.moreLink}>
              open the full index <span aria-hidden="true">▸</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── stack ────────────────────────────────────────────── */}
      <section className={`section ${styles.stackSection}`}>
        <div className="shell">
          <ParticleZone id="home-stack" kind="wave" />
          <Reveal as="p" className="eyebrow">
            03 — stack
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={60}>
            The tools in the drawer
          </Reveal>
          <div className={styles.stackGrid}>
            {Object.entries(profile.stack).map(([group, items], i) => (
              <Reveal key={group} className={styles.stackGroup} delay={i * 80}>
                <h3>{group}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[0, 1].map((k) => (
              <span key={k} className={styles.marqueeContent}>
                {[...profile.stack.languages, ...profile.stack.data, 'React', 'Leaflet', 'Intune'].join(
                  ' · ',
                )}{' '}
                ·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── timeline teaser ──────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <Reveal as="p" className="eyebrow">
            04 — log
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={60}>
            Recent commits
          </Reveal>
          <ol className={styles.log}>
            {profile.timeline.slice(0, 4).map((item, i) => (
              <Reveal as="li" key={item.hash} delay={i * 70} className={styles.logItem}>
                <span className={styles.logHash}>{item.hash}</span>
                <span className={styles.logBranch}>{item.branch}</span>
                <span className={styles.logDate}>{item.date}</span>
                <div className={styles.logBody}>
                  <h3>
                    {item.title} <em>· {item.role}</em>
                  </h3>
                  <p>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={120} className={styles.workMore}>
            <Link to="/profile" className={styles.moreLink}>
              read the whole log <span aria-hidden="true">▸</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
