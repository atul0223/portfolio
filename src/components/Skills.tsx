import { motion } from 'framer-motion'
import { skills } from '../data'
import SectionTitle from './SectionTitle'

const all = skills.flatMap((g) => g.items)
const half = Math.ceil(all.length / 2)
const rowsOfSkills = [all.slice(0, half), all.slice(half)]

function Marquee({ items, reverse }: { items: string[]; reverse?: boolean }) {
  // Content is duplicated so the -50% translate loops seamlessly.
  const doubled = [...items, ...items]
  return (
    <div className={reverse ? 'marquee reverse' : 'marquee'} aria-hidden>
      <div className="marquee-track">
        {doubled.map((s, i) => (
          <span key={i} className="marquee-item">
            {s}
            <em>✺</em>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="skills">
      <div className="section">
        <SectionTitle kicker="03" title="Toolkit" sub="What I reach for to ship end-to-end products" />
      </div>
      <Marquee items={rowsOfSkills[0]} />
      <Marquee items={rowsOfSkills[1]} reverse />
      <div className="section skill-cols">
        {skills.map((g, gi) => (
          <motion.div
            key={g.group}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: gi * 0.08 }}
          >
            <h3 className="mono">{g.group}</h3>
            <ul>
              {g.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
