import { useId, type CSSProperties } from 'react'
import type { Project } from '../useGithubRepos'

/** Generated cover art — each project's planet from the hero, drawn flat with its orbits. */
export default function ProjectCover({ project, index }: { project: Project; index: number }) {
  const id = useId()
  return (
    <div className="cover" style={{ '--c': project.color } as CSSProperties}>
      <svg className="cover-art" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id={`${id}-p`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="35%" stopColor={project.color} />
            <stop offset="100%" stopColor="#0b0a09" />
          </radialGradient>
          <pattern id={`${id}-g`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity="0.07" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill={`url(#${id}-g)`} />
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={i}
            cx="300"
            cy="180"
            rx={70 + i * 48}
            ry={(70 + i * 48) * 0.32}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.35 - i * 0.07}
            transform="rotate(-12 300 180)"
          />
        ))}
        <circle cx="300" cy="180" r="38" fill={`url(#${id}-p)`} />
        {project.featured && (
          <ellipse
            cx="300"
            cy="180"
            rx="62"
            ry="14"
            fill="none"
            stroke={project.color}
            strokeWidth="4"
            strokeOpacity="0.7"
            transform="rotate(-12 300 180)"
          />
        )}
        <circle cx="120" cy="60" r="3" fill="currentColor" opacity="0.6" />
        <circle cx="200" cy="30" r="1.5" fill="currentColor" opacity="0.5" />
        <circle cx="60" cy="130" r="2" fill="currentColor" opacity="0.4" />
      </svg>
      <div className="cover-top mono">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>{project.category}</span>
      </div>
      <div className="cover-bottom">
        <strong>{project.title}</strong>
        <span className="mono">{project.stack.slice(0, 3).join(' · ')}</span>
      </div>
    </div>
  )
}
