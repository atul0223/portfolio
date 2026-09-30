import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '../data'

export default function Contact() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(email)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <section id="contact" className="section contact">
      <span className="mono kicker">(05) Contact</span>
      <h2 className="contact-big">
        <motion.span
          initial={{ y: '105%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        >
          Let's build
        </motion.span>
        <motion.span
          initial={{ y: '105%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <em>something.</em>
        </motion.span>
      </h2>
      <p className="contact-sub">Open to full-time roles, freelance work and collaborations.</p>

      <button className="email" onClick={() => copy(profile.email)}>
        <span>{profile.email}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={copied === profile.email ? 'y' : 'n'}
            className="copy-state mono"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {copied === profile.email ? '✓ copied' : 'click to copy'}
          </motion.span>
        </AnimatePresence>
      </button>

      <p className="alt-email">
        <span className="mono dim">Alternate</span>
        <button onClick={() => copy(profile.altEmail)}>{profile.altEmail}</button>
        <span className="mono dim">{copied === profile.altEmail ? '✓ copied' : ''}</span>
      </p>

      <div className="socials">
        <a href={`mailto:${profile.email}`}>Email ↗</a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a href={profile.resume} download>
          Résumé ↓
        </a>
      </div>
    </section>
  )
}
