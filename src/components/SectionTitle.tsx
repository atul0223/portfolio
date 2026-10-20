import { motion } from 'framer-motion'

export default function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="section-title" data-num={kicker}>
      <motion.span
        className="mono kicker"
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
      >
        ({kicker})
      </motion.span>
      <h2 aria-label={title}>
        {title.split(' ').map((word, i) => (
          <span className="word" key={i} aria-hidden>
            <motion.span
              initial={{ y: '110%', rotate: 4 }}
              whileInView={{ y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>
      <motion.i
        className="section-rule"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
        aria-hidden
      />
      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {sub}
        </motion.p>
      )}
    </div>
  )
}
