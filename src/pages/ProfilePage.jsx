import ParticleZone from '../components/ParticleZone'
import Reveal from '../components/Reveal'
import WorkflowVisual from '../components/WorkflowVisual'
import { profile } from '../data/profile'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  return (
    <>
      {/* ── hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={`shell ${styles.heroGrid}`}>
          <Reveal as="p" className={styles.kicker}>
            08 / profile.sys — the long version
          </Reveal>
          <h1 className={styles.title}>
            <span className="glitch">I bridge research and production.</span>
          </h1>
          <div className={styles.titleParticles}>
            <ParticleZone
              id="profile-title"
              text="PROFIL.SYS"
              font='700 120px "Space Grotesk", monospace'
              step={9}
              priority={2}
            />
          </div>
          <div className={styles.intro}>
            <Reveal className={styles.introCol} delay={80}>
              <span className={styles.introLabel}>// today</span>
              <p>
                I&apos;m a software engineer in Phoenix, Arizona. At Resilient Health I administer
                device fleets and chase down operational incidents inside a HIPAA-regulated
                environment — which means I see every day how software actually lives, fails, and
                gets fixed in production.
              </p>
            </Reveal>
            <Reveal className={styles.introCol} delay={160}>
              <span className={styles.introLabel}>// the path</span>
              <p>
                Before software, I worked tier-1 security operations and technical support QA: log
                correlation, forensic triage, regex-based alerting, and automation in Python and
                Bash. Then ASU, a B.S. in computer science, and a turn toward building: machine
                learning, data visualization, full-stack tools like the Phoenix Fiber Build Map,
                and native Android in Kotlin — PostBoard is a complete Compose app with MVVM,
                Hilt, Retrofit, and a tested ViewModel. I like the whole line — framing the
                problem, training the model, shipping the interface, operating the result.
              </p>
            </Reveal>
          </div>
          <Reveal className={styles.statusLine} delay={240}>
            <span className={styles.statusLed} />
            status: {profile.status} · {profile.location}
          </Reveal>
        </div>
      </section>

      {/* ── roles ────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <ParticleZone id="profile-roles" kind="network" />
          <Reveal as="p" className="eyebrow">
            01 — the five files
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={60}>
            What I actually do
          </Reveal>
          <div className={styles.roles}>
            {profile.roles.map((role, i) => (
              <Reveal key={role.id} className={styles.role} delay={i * 90}>
                <span className={styles.roleNum}>{role.num}</span>
                <div className={styles.roleMain}>
                  <h3>
                    {role.title} <em>{role.file}</em>
                  </h3>
                  <p>{role.blurb}</p>
                  <ul className={styles.proof}>
                    {role.proof.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── full log ─────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <ParticleZone id="profile-log" kind="wave" />
          <Reveal as="p" className="eyebrow">
            02 — parcours.log
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={60}>
            git log --all
          </Reveal>
          <div className={styles.logHead}>$ git log --graph --all --decorate</div>
          <ol className={styles.log}>
            {profile.timeline.map((item, i) => (
              <Reveal as="li" key={item.hash} className={styles.logItem} delay={i * 70}>
                <div className={styles.logMeta}>
                  <span className={styles.logHash}>{item.hash}</span>
                  <span className={styles.logBranch}>{item.branch}</span>
                  <span className={styles.logDate}>{item.date}</span>
                </div>
                <div className={styles.logBody}>
                  <h3>
                    {item.title} <em>· {item.role}</em>
                  </h3>
                  <p className={styles.logPlace}>{item.place}</p>
                  <p>{item.desc}</p>
                  <ul className={styles.points}>
                    {item.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                  <ul className={styles.proof}>
                    {item.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── workflow (the bottom visual) ─────────────────────── */}
      <WorkflowVisual />
    </>
  )
}
