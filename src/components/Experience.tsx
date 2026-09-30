import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { education, experience } from '../data'
import SectionTitle from './SectionTitle'

export default function Experience() {
  const [open, setOpen] = useState(0)

  return (
    <section id="experience" className="section">
      <SectionTitle kicker="04" title="Experience" sub="Click a role to expand" />
      <div className="exp">
        {experience.map((e, i) => (
          <motion.div
            key={e.company}
            className={open === i ? 'exp-item open' : 'exp-item'}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
          >
            <button className="exp-row" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              <span className="mono kicker">{String(i + 1).padStart(2, '0')}</span>
              <span className="exp-head">
                <span className="exp-company">{e.company}</span>
                <span className="exp-role">
                  {e.role} <span className="dim">· {e.type}</span>
                </span>
              </span>
              <span className="exp-when mono">
                {e.period}
                <span className="dim">{e.location}</span>
              </span>
              <span className="exp-toggle">{open === i ? '−' : '+'}</span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.ul
                  className="exp-points"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {e.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="edu"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="mono kicker">Education</span>
        <div>
          <h3>{education.degree}</h3>
          <p>{education.school}</p>
          <p className="dim">{education.university}</p>
        </div>
        <span className="mono dim">{education.period}</span>
      </motion.div>
    </section>
  )
}
