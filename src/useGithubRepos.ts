import { useEffect, useState } from 'react'
import { GITHUB_USER, hiddenRepos, PROJECT_COLORS, projectMeta, type ProjectMeta } from './data'

export type Project = ProjectMeta & {
  name: string
  color: string
  repoUrl: string
  liveUrl?: string
  stars: number
  updatedAt: string
  language?: string
}

type Repo = {
  name: string
  html_url: string
  homepage: string | null
  description: string | null
  stargazers_count: number
  updated_at: string
  language: string | null
  fork: boolean
}

const fromRepo = (r: Repo): Project => {
  const meta = projectMeta[r.name]
  return {
    title: meta?.title ?? r.name.replace(/[-_]+/g, ' ').trim(),
    tagline: meta?.tagline ?? r.description ?? 'A project on GitHub.',
    highlights: meta?.highlights ?? [],
    stack: meta?.stack ?? (r.language ? [r.language] : []),
    category: meta?.category ?? 'Web',
    featured: meta?.featured,
    name: r.name,
    color: '',
    repoUrl: r.html_url,
    liveUrl: (meta?.liveUrl !== undefined ? meta.liveUrl : r.homepage) || undefined,
    stars: r.stargazers_count,
    updatedAt: r.updated_at,
    language: r.language ?? undefined,
  }
}

// Used when the GitHub API is unreachable or rate-limited (60 req/hr unauthenticated).
const fallback: Project[] = Object.entries(projectMeta).map(([name, meta]) => ({
  ...meta,
  liveUrl: meta.liveUrl ?? undefined,
  name,
  color: '',
  repoUrl: `https://github.com/${GITHUB_USER}/${name}`,
  stars: 0,
  updatedAt: '',
}))

const sortProjects = (list: Project[]) =>
  [...list]
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.updatedAt.localeCompare(a.updatedAt))
    .map((p, i) => ({ ...p, color: PROJECT_COLORS[i % PROJECT_COLORS.length] }))

export function useGithubRepos() {
  const [projects, setProjects] = useState<Project[]>(sortProjects(fallback))
  const [live, setLive] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, {
      signal: ctrl.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((repos: Repo[]) => {
        const list = repos.filter((r) => !r.fork && !hiddenRepos.has(r.name)).map(fromRepo)
        if (list.length) {
          setProjects(sortProjects(list))
          setLive(true)
        }
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  return { projects, live }
}
