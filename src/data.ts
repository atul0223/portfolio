export const GITHUB_USER = 'atul0223'

/** One colour per project — shared by its 3D planet and its cover art. */
export const PROJECT_COLORS = ['#ff6b3d', '#ffd166', '#f1ece4', '#e8a87c', '#ff9f6b', '#c9b79c', '#f4845f', '#d9d0c1']

export const profile = {
  name: 'Atul Sharma',
  roles: [
    'Full Stack Engineer',
    'Mobile App Developer · React Native',
    'DevOps Engineer',
    'TypeScript Enthusiast',
  ],
  bio: 'I build and ship web and mobile apps end to end — from React & React Native interfaces to secure Node.js APIs, Docker and cloud deployments.',
  summary: [
    'Full Stack Engineer with 10+ months of professional experience building and shipping web and mobile applications using React, React Native (Expo), Node.js, Express, TypeScript and MongoDB.',
    'I develop cross-platform Android/iOS apps and admin portals, design secure REST APIs with JWT and role-based access control, and own deployment end to end with Docker, Linux and cloud platforms (AWS, Render, Vercel). I care about clean, scalable code, performance and reliable production releases.',
  ],
  location: 'Meerut, Uttar Pradesh, India',
  email: 'atulbramhan@gmail.com',
  altEmail: 'atulsharma9487@gmail.com',
  github: 'https://github.com/atul0223',
  linkedin: 'https://www.linkedin.com/in/atul-sharma-9b183b250/',
  avatar: 'https://avatars.githubusercontent.com/u/216735811?v=4',
  resume: '/Atul_Sharma_Resume.pdf',
  languages: ['English', 'Hindi'],
}

export const stats = [
  { value: '10+', label: 'months shipping in production' },
  { value: '3', label: 'platforms — Android, iOS & Web' },
  { value: '6+', label: 'full-stack projects on GitHub' },
  { value: '2026', label: 'B.Tech CSE graduate' },
]

export const pillars = [
  {
    title: 'Web',
    body: 'React, Next.js and Tailwind frontends; admin portals; Node/Express REST APIs with JWT, RBAC and rate limiting.',
  },
  {
    title: 'Mobile',
    body: 'Cross-platform Android & iOS apps with React Native, Expo Router and Reanimated — shipped as production APK/AAB via EAS Build.',
  },
  {
    title: 'DevOps',
    body: 'Multi-stage Docker builds, Linux servers, AWS, Render blueprints (IaC), Vercel, Cloudinary CDN, FFmpeg pipelines and secrets management.',
  },
]

export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['JavaScript (ES6+)', 'TypeScript', 'HTML5', 'CSS3', 'SQL'] },
  { group: 'Frontend', items: ['React.js', 'Next.js', 'Tailwind CSS', 'ShadCN UI', 'Bootstrap', 'Responsive Design'] },
  {
    group: 'Mobile',
    items: ['React Native', 'Expo', 'Expo Router', 'Reanimated', 'Expo Video', 'AsyncStorage', 'EAS Build'],
  },
  {
    group: 'Backend',
    items: ['Node.js', 'Express.js', 'REST APIs', 'Socket.IO', 'WebSockets', 'JWT Auth', 'RBAC', 'Rate Limiting', 'Multer'],
  },
  { group: 'Databases', items: ['MongoDB', 'Mongoose ODM', 'MySQL'] },
  {
    group: 'DevOps & Cloud',
    items: ['Docker', 'Linux', 'AWS', 'Render (IaC)', 'Vercel', 'Netlify', 'Cloudinary CDN', 'FFmpeg'],
  },
  { group: 'Tools', items: ['Git & GitHub', 'Postman', 'VS Code', 'npm / yarn', 'AI-assisted dev'] },
]

export const experience = [
  {
    role: 'Full Stack Engineer',
    type: 'Full-time',
    company: 'MS Finline Pvt Ltd',
    period: 'Dec 2025 — Present',
    location: 'Meerut, UP · On-site',
    points: [
      'Develop and maintain full-stack web and mobile apps with React, React Native (Expo), Node.js, Express, TypeScript and MongoDB.',
      'Built cross-platform Android and iOS apps and generated production builds (APK/AAB) with EAS Build.',
      'Developed admin and sub-admin web portals plus user-facing REST APIs for a financial services platform, with authentication and role-based access control.',
      'Containerized backend services with Docker and managed deployments on Linux-based cloud environments, handling environment config and secrets.',
      'Collaborated on requirements, code reviews and debugging to deliver stable production releases.',
    ],
  },
  {
    role: 'Full Stack Engineer Intern',
    type: 'Internship',
    company: 'Creative Tura',
    period: 'Nov 2025 — Dec 2025',
    location: 'Noida, UP · On-site',
    points: [
      'Gained hands-on experience in full-stack web development in an intensive internship.',
      'Built responsive frontend features with React.js and Tailwind CSS and contributed to end-to-end project delivery.',
    ],
  },
]

export const education = {
  degree: 'B.Tech, Computer Science & Engineering',
  school: 'Neelkanth Institute of Technology, Meerut',
  university: 'Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow',
  period: '2022 — 2026',
}

export type ProjectMeta = {
  title: string
  tagline: string
  highlights: string[]
  stack: string[]
  category: 'Mobile' | 'Web'
  featured?: boolean
}

/** Hand-written details layered on top of the live GitHub data, keyed by repo name. */
export const projectMeta: Record<string, ProjectMeta> = {
  LMS_mobile_application: {
    title: 'Full-Stack LMS',
    tagline: 'Cross-platform learning app with a 500 MB video pipeline and adaptive HLS streaming.',
    highlights: [
      'Android, iOS & Web app with separate Student and Teacher workflows: course feed & search, enrollment, "My Learning" dashboard and a Teacher Studio',
      'Video pipeline for uploads up to 500 MB — direct signed uploads to Cloudinary for files ≤95 MB, server-side FFmpeg compression for larger ones',
      'Adaptive HLS streaming with short-lived signed playback URLs',
      'OTP email verification (SHA-256 hashed), JWT auth, role-based access control and IP-based rate limiting',
      'Multi-stage Docker build (Debian Slim + FFmpeg, non-root user, health checks) deployed on Render via an IaC blueprint (render.yaml)',
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'Node.js', 'Express 5', 'MongoDB', 'Docker', 'Cloudinary', 'FFmpeg'],
    category: 'Mobile',
    featured: true,
  },
  'Social-media-platform-V2': {
    title: 'LoveChat',
    tagline: 'Instagram/Pinterest-style social platform with real-time chat.',
    highlights: [
      'Secure JWT authentication, posts with likes and comments',
      'Follow / unfollow / block networking',
      'Real-time one-to-one and group chat with Socket.IO and WebSockets',
      'Frontend deployed on Vercel',
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Tailwind CSS'],
    category: 'Web',
    featured: true,
  },
  'Social-media-platform': {
    title: 'InstantMedia',
    tagline: 'The first version of my social platform, inspired by Pinterest and Instagram.',
    highlights: [
      'Real-time features powered by Socket.IO',
      'Secure JWT authentication and media uploads',
      'Responsive UI for web and mobile',
    ],
    stack: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Socket.IO'],
    category: 'Web',
  },
  'library-management-system': {
    title: 'Library Management System',
    tagline: 'End-to-end library system with borrow/return workflows and a dashboard.',
    highlights: [
      'Secure JWT authentication',
      'Book borrow and return workflows with a dashboard',
      'Well-structured MongoDB / Mongoose schemas',
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    category: 'Web',
    featured: true,
  },
  'note-taking-application': {
    title: 'Note-Taking App',
    tagline: 'A clean, reliable full-stack notes app focused on UX.',
    highlights: ['Full development lifecycle, idea to deployment', 'Full-stack TypeScript'],
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
    category: 'Web',
  },
  DemoProject: {
    title: 'Demo Project',
    tagline: 'Full-stack JavaScript app with separate frontend and backend.',
    highlights: ['React frontend with Node.js backend', 'Deployed on Vercel'],
    stack: ['React', 'JavaScript', 'Node.js'],
    category: 'Web',
  },
  'DemoTask3-': {
    title: 'Internship Screening Task',
    tagline: 'Screening task issued by Ideovent Technologies.',
    highlights: ['Built in TypeScript'],
    stack: ['TypeScript'],
    category: 'Web',
  },
}

/** Repos hidden from the grid (e.g. the profile README repo). */
export const hiddenRepos = new Set([GITHUB_USER])
