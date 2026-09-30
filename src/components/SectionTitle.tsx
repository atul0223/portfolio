import { motion } from 'framer-motion'

export default function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="section-title" data-num={kicker}>
      <span className="mono kicker">({kicker})</span>
      <h2>
        <motion.span
          initial={{ y: '105%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {title}
        </motion.span>
      </h2>
      {sub && <p>{sub}</p>}
    </div>
  )
}
