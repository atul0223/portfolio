import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'framer-motion'
import { skills } from '../data'
import SectionTitle from './SectionTitle'
import { TagSphere } from './ui'

const all = skills.flatMap((g) => g.items)
const half = Math.ceil(all.length / 2)
const rowsOfSkills = [all.slice(0, half), all.slice(half)]

/** Drifts constantly, and speeds up (and leans) with scroll velocity. */
function Marquee({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [-2000, 0, 2000], [-4, 0, 4], { clamp: false })
  const skew = useTransform(velocity, [-2500, 2500], [6, -6])
  const dir = useRef(reverse ? -1 : 1)
  // Content is duplicated so wrapping at -50% loops seamlessly.
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`)
  const doubled = [...items, ...items]

  useAnimationFrame((_, delta) => {
    const b = boost.get()
    if (b < 0) dir.current = reverse ? 1 : -1
    else if (b > 0) dir.current = reverse ? -1 : 1
    base.set(base.get() - dir.current * 1.4 * (delta / 1000) * (1 + Math.abs(b)))
  })

  return (
    <div className={reverse ? 'marquee reverse' : 'marquee'} aria-hidden>
      <motion.div className="marquee-track" style={{ x, skewX: skew }}>
        {doubled.map((s, i) => (
          <span key={i} className="marquee-item">
            {s}
            <em>✺</em>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="skills">
      <div className="section">
        <SectionTitle kicker="04" title="Toolkit" sub="What I reach for to ship end-to-end products" />
      </div>
      <Marquee items={rowsOfSkills[0]} />
      <Marquee items={rowsOfSkills[1]} reverse />
      <div className="section skill-wrap">
        <motion.div
          className="skill-sphere"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <TagSphere items={all} />
        </motion.div>
        <div className="skill-cols">
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
      </div>
    </section>
  )
}
