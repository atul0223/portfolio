import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { pillars, profile, stats } from '../data'
import SectionTitle from './SectionTitle'
import { CountUp, Roll } from './ui'

const icons: Record<string, ReactNode> = {
  Web: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="6" width="26" height="20" rx="3" />
      <path d="M3 11h26M7 8.5h.01M10 8.5h.01M13 8.5h.01M11 17l-3 2.5 3 2.5M21 17l3 2.5-3 2.5M17.5 15.5l-3 8" />
    </svg>
  ),
  Mobile: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="9" y="3" width="14" height="26" rx="3" />
      <path d="M14 6.5h4M15 25.5h2M13 13h6M13 17h6M13 21h3" />
    </svg>
  ),
  DevOps: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 12l12-6 12 6-12 6-12-6z" />
      <path d="M4 17l12 6 12-6M4 22l12 6 12-6" />
    </svg>
  ),
}

export default function About() {
  return (
    <section id="about" className="section">
      <SectionTitle kicker="01" title="About me" />

      <div className="about">
        <motion.div
          className="about-photo"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img src={profile.avatar} alt={profile.name} loading="lazy" />
          <span className="mono">{profile.location}</span>
        </motion.div>

        <div className="about-text">
          {profile.summary.map((p, i) => (
            <motion.p
              key={i}
              className={i === 0 ? 'about-lead' : ''}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              {p}
            </motion.p>
          ))}
          <div className="cta">
            <a href={profile.resume} download className="btn primary">
              <Roll>Download résumé ↓</Roll>
            </a>
            <a href="#contact" className="btn">
              <Roll>Get in touch →</Roll>
            </a>
          </div>
          <p className="mono dim">Speaks {profile.languages.join(' · ')}</p>
        </div>
      </div>

      <div className="stats">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <CountUp value={s.value} />
            <span>{s.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="pillars">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            className="pillar"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="pillar-top">
              <span className="pillar-icon">{icons[p.title]}</span>
              <span className="mono kicker">0{i + 1}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
