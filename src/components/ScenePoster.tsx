import type { Project } from '../useGithubRepos'

// Projection of the 3D scene's opening camera shot, so the swap to WebGL is seamless:
// ~96px per world unit, orbits flattened by the camera's ~19° elevation.
const CX = 800
const CY = 500
const UNIT = 96
const FLAT = 0.33

/** Lightweight SVG stand-in for the 3D solar system, shown until the WebGL scene loads. */
export default function ScenePoster({ projects }: { projects: Project[] }) {
  return (
    <svg className="scene-poster" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <radialGradient id="poster-halo">
          <stop offset="0" stopColor="#ff965a" stopOpacity="0.8" />
          <stop offset="0.3" stopColor="#ff6b3d" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ff6b3d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="poster-core" cx="0.38" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffd2b0" />
          <stop offset="0.45" stopColor="#ff6b3d" />
          <stop offset="1" stopColor="#a8300f" />
        </radialGradient>
      </defs>

      <circle cx={CX} cy={CY} r="230" fill="url(#poster-halo)" />
      {projects.map((p, i) => {
        const r = (2.4 + i * 0.72) * UNIT
        return (
          <ellipse key={p.name} cx={CX} cy={CY} rx={r} ry={r * FLAT} fill="none" stroke="#f1ece4" strokeOpacity="0.1" />
        )
      })}
      <circle cx={CX} cy={CY} r="75" fill="url(#poster-core)" />
      <circle cx={CX} cy={CY} r="123" fill="none" stroke="#ffb38a" strokeOpacity="0.18" />

      {projects.map((p, i) => {
        const r = (2.4 + i * 0.72) * UNIT
        const a = (i / projects.length) * Math.PI * 2
        const size = (p.featured ? 0.3 : 0.2) * UNIT
        return (
          <circle
            key={p.name}
            cx={CX + Math.cos(a) * r}
            cy={CY + Math.sin(a) * r * FLAT}
            r={size}
            fill={p.color}
          />
        )
      })}
    </svg>
  )
}
