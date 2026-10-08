import { motion } from 'framer-motion'
import { clientWork } from '../data'
import SectionTitle from './SectionTitle'
import { Roll } from './ui'

export default function ClientWork() {
  return (
    <section id="work" className="section">
      <SectionTitle kicker="03" title="Client work" sub="Design concepts built and deployed for real businesses" />

      <motion.div
        className="client-head"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div>
          <span className="mono kicker">{clientWork.location}</span>
          <h3>{clientWork.client}</h3>
        </div>
        <p>{clientWork.brief}</p>
      </motion.div>

      <div className="concepts">
        {clientWork.concepts.map((c, i) => (
          <motion.article
            key={c.url}
            className="concept"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
          >
            <a href={c.url} target="_blank" rel="noreferrer" className="browser" aria-label={`Open ${c.name} live`}>
              <div className="browser-bar">
                <span />
                <span />
                <span />
                <span className="browser-url mono">{c.url.replace(/^https:\/\//, '').replace(/\/$/, '')}</span>
              </div>
              {/* Tall screenshot that scrolls inside the frame on hover. */}
              <div className="browser-view">
                <img src={c.image} alt={`${c.name} homepage concept`} loading="lazy" />
              </div>
            </a>

            <div className="concept-meta">
              <span className="mono kicker">Concept {String(i + 1).padStart(2, '0')}</span>
              <span className="swatches" aria-hidden>
                {c.swatches.map((s) => (
                  <span key={s} style={{ background: s }} />
                ))}
              </span>
            </div>
            <h4>{c.name}</h4>
            <p>{c.note}</p>
            <div className="concept-foot">
              <span className="mono dim">
                {c.mood} · {c.font}
              </span>
              <a href={c.url} target="_blank" rel="noreferrer" className="btn">
                <Roll>View live ↗</Roll>
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
