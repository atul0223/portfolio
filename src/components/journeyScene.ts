import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/** Distance between stations along the flight path. */
export const GAP = 16

type Station = { group: THREE.Group; update: (t: number, focus: number) => void }

const chrome = (color = 0xdedad2) => new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: 0.2, envMapIntensity: 0.95, clearcoat: 1, clearcoatRoughness: 0.1 })
const glow = (color: number, intensity = 1.6) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity })

/* 0 · AS monogram made of chrome tubes, with orbit rings */
function monogram(): Station {
  const g = new THREE.Group()
  const mat = chrome()
  const tube = (pts: [number, number][], closed = false, r = 0.16) =>
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), closed, 'catmullrom', 0.08), 160, r, 20, closed), mat)
  const A = new THREE.Group()
  A.add(tube([[-1.1, -1.3], [-0.55, 0.15], [0, 1.4]], false), tube([[0, 1.4], [0.55, 0.15], [1.1, -1.3]], false), tube([[-0.58, -0.25], [0.58, -0.25]], false, 0.13))
  A.position.x = -1.05
  const S = tube([[0.95, 1.05], [0.35, 1.38], [-0.45, 1.15], [-0.6, 0.55], [0.2, 0.05], [0.75, -0.55], [0.5, -1.2], [-0.25, -1.4], [-0.95, -1.05]])
  S.position.x = 1.25
  g.add(A, S)
  const rings: THREE.Mesh[] = []
  ;[2.6, 3.1, 3.7].forEach((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, i === 1 ? 0.02 : 0.012, 12, 240), i === 1 ? glow(0xffb547, 1.8) : chrome(0x8a8578))
    m.rotation.set(Math.PI / 2 + (i - 1) * 0.35, i * 0.4, 0)
    rings.push(m)
    g.add(m)
  })
  return {
    group: g,
    update: (t) => {
      A.rotation.y = S.rotation.y = Math.sin(t * 0.5) * 0.35
      rings.forEach((r, i) => { r.rotation.z = t * (0.15 + i * 0.07) * (i % 2 ? -1 : 1) })
    },
  }
}

/* 1 · LMS: video screens orbiting a glowing play button */
function streaming(): Station {
  const g = new THREE.Group()
  const play = new THREE.Shape()
  play.moveTo(-0.55, -0.7); play.lineTo(0.8, 0); play.lineTo(-0.55, 0.7); play.closePath()
  const btn = new THREE.Mesh(new THREE.ExtrudeGeometry(play, { depth: 0.3, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 4 }), glow(0x7aa8ff, 1.6))
  btn.geometry.center()
  const disc = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.07, 16, 120), chrome())
  g.add(btn, disc)
  const screens = new THREE.Group()
  const n = 12
  for (let i = 0; i < n; i++) {
    const s = new THREE.Group()
    const frame = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.68, 0.06, 3, 0.04), chrome(0x2a2d33))
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.03, 0.56), glow(i % 3 === 0 ? 0xffb547 : 0x3d6bd8, i % 3 === 0 ? 0.8 : 0.7))
    scr.position.z = 0.035
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.9 * Math.random() + 0.05, 0.03), glow(0xffffff, 1.5))
    bar.position.set(-0.45, -0.22, 0.04)
    s.add(frame, scr, bar)
    const a = (i / n) * Math.PI * 2
    s.position.set(Math.cos(a) * 3.1, Math.sin(a * 2) * 0.5, Math.sin(a) * 3.1)
    s.lookAt(0, s.position.y, 0)
    s.rotateY(Math.PI)
    screens.add(s)
  }
  g.add(screens)
  return {
    group: g,
    update: (t) => {
      screens.rotation.y = t * 0.18
      btn.rotation.y = Math.sin(t * 0.8) * 0.5
      btn.scale.setScalar(1 + Math.sin(t * 2.4) * 0.04)
      disc.rotation.x = Math.PI / 2 + Math.sin(t * 0.6) * 0.2
    },
  }
}

/* 2 · LoveChat: a cluster of chat bubbles */
function chat(): Station {
  const g = new THREE.Group()
  const bubbles: { m: THREE.Group; base: THREE.Vector3; ph: number }[] = []
  const specs = [
    [-1.4, 1.1, 0.4, 1.8, 0.75, 0xff5d8f], [1.0, 0.75, -0.3, 1.5, 0.65, 0xe9e6df], [-0.6, -0.15, 0.9, 2.1, 0.8, 0xff5d8f],
    [1.5, -0.55, 0.2, 1.3, 0.6, 0xe9e6df], [-1.2, -1.35, -0.4, 1.6, 0.65, 0xe9e6df], [0.9, -1.75, 0.6, 1.2, 0.55, 0xff5d8f],
  ] as const
  specs.forEach(([x, y, z, w, h, c], i) => {
    const b = new THREE.Group()
    const mat = c === 0xff5d8f ? new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.25, clearcoat: 1, emissive: c, emissiveIntensity: 0.08 }) : chrome(c)
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.35, 6, Math.min(h / 2 - 0.01, 0.3)), mat)
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 3), mat)
    const left = i % 2 === 0
    tail.position.set(left ? -w / 2 + 0.25 : w / 2 - 0.25, -h / 2 - 0.08, 0)
    tail.rotation.z = left ? -0.5 : 0.5
    b.add(body, tail)
    for (let k = 0; k < 3; k++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), glow(c === 0xff5d8f ? 0xffffff : 0xff5d8f, 1.6))
      dot.position.set(-0.25 + k * 0.25, 0, 0.19)
      b.add(dot)
    }
    b.position.set(x, y, z)
    bubbles.push({ m: b, base: b.position.clone(), ph: i * 1.3 })
    g.add(b)
  })
  return {
    group: g,
    update: (t) => {
      bubbles.forEach(({ m, base, ph }) => {
        m.position.y = base.y + Math.sin(t * 1.3 + ph) * 0.12
        m.rotation.y = Math.sin(t * 0.6 + ph) * 0.35
        m.rotation.z = Math.sin(t * 0.8 + ph) * 0.05
      })
      g.rotation.y = Math.sin(t * 0.25) * 0.3
    },
  }
}

/* 3 · Library: a leaning stack of books */
function books(): Station {
  const g = new THREE.Group()
  const cols = [0x8f2d2d, 0x1f3a5f, 0xd9b26a, 0x2e5e4e, 0xe9e6df, 0x5a3d6b, 0xb5552d]
  const items: THREE.Mesh[] = []
  let y = -1.6
  for (let i = 0; i < 9; i++) {
    const h = 0.28 + Math.random() * 0.16
    const w = 2.2 + Math.random() * 0.6
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, 1.5 + Math.random() * 0.3, 3, 0.04), new THREE.MeshPhysicalMaterial({ color: cols[i % cols.length], roughness: 0.55, clearcoat: 0.4 }))
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.06, h * 1.02, 1.55 + 0.32), chrome(0xd9b26a))
    band.position.x = w * 0.32
    m.add(band)
    m.position.set((Math.random() - 0.5) * 0.4, y + h / 2, 0)
    m.rotation.y = (Math.random() - 0.5) * 0.5
    y += h + 0.01
    items.push(m)
    g.add(m)
  }
  const open = new THREE.Group()
  const pageMat = new THREE.MeshStandardMaterial({ color: 0xd9d4ca, roughness: 0.9, side: THREE.DoubleSide, envMapIntensity: 0.5 })
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5, 8, 1), pageMat)
    const pos = p.geometry.attributes.position
    for (let v = 0; v < pos.count; v++) pos.setZ(v, Math.sin((pos.getX(v) + 0.55) / 1.1 * Math.PI) * 0.12)
    p.geometry.computeVertexNormals()
    p.position.x = s * 0.56
    p.rotation.y = -s * 0.25
    open.add(p)
  }
  open.position.set(0, y + 0.9, 0.2)
  open.rotation.x = -0.5
  g.add(open)
  return {
    group: g,
    update: (t) => {
      items.forEach((m, i) => { m.rotation.y += Math.sin(t * 0.5 + i) * 0.0008 })
      open.position.y = y + 0.9 + Math.sin(t * 1.2) * 0.12
      open.rotation.z = Math.sin(t * 0.7) * 0.1
      g.rotation.y = Math.sin(t * 0.3) * 0.35
    },
  }
}

/* 4 · AmaPlayer: a football bouncing on a glowing pitch */
function football(): Station {
  const g = new THREE.Group()
  const geo = new THREE.IcosahedronGeometry(1.15, 1).toNonIndexed()
  const colors: number[] = []
  const base = new THREE.IcosahedronGeometry(1, 0).attributes.position
  const corners: THREE.Vector3[] = []
  for (let v = 0; v < base.count; v++) {
    const p = new THREE.Vector3().fromBufferAttribute(base, v).normalize()
    if (!corners.some((q) => q.distanceTo(p) < 0.01)) corners.push(p)
  }
  const pos = geo.attributes.position
  for (let f = 0; f < pos.count / 3; f++) {
    const c = new THREE.Vector3()
    for (let k = 0; k < 3; k++) c.add(new THREE.Vector3().fromBufferAttribute(pos, f * 3 + k))
    c.normalize()
    // darken the faces that touch one of the 12 original vertices: pentagon patches
    const dark = corners.some((v) => v.dot(c) > 0.94)
    const col = dark ? [0.04, 0.04, 0.05] : [0.78, 0.77, 0.74]
    for (let k = 0; k < 3; k++) colors.push(...col)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  const ball = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, clearcoat: 0.15, flatShading: true }))
  const pitch = new THREE.Group()
  const line = glow(0x5ee08a, 2)
  pitch.add(new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.025, 8, 160), line))
  const mid = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 7), line)
  mid.rotation.y = Math.PI / 2
  pitch.add(mid)
  const field = new THREE.Mesh(new THREE.CircleGeometry(3.6, 64), new THREE.MeshStandardMaterial({ color: 0x0d2a1a, roughness: 0.9, transparent: true, opacity: 0.85 }))
  field.rotation.x = -Math.PI / 2
  pitch.add(field)
  pitch.children.slice(0, 2).forEach((c) => { c.rotation.x = c === mid ? 0 : Math.PI / 2 })
  pitch.position.y = -1.6
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -1.58
  g.add(pitch, shadow, ball)
  return {
    group: g,
    update: (t) => {
      const b = Math.abs(Math.sin(t * 2.2))
      ball.position.y = -0.4 + b * 1.4
      ball.rotation.x = t * 1.6
      ball.rotation.z = t * 0.6
      ball.scale.set(1 + (1 - b) * 0.06 * (b < 0.15 ? 1 : 0), 1 - (b < 0.15 ? 0.08 : 0), 1)
      shadow.scale.setScalar(1.2 - b * 0.5)
      ;(shadow.material as THREE.MeshBasicMaterial).opacity = 0.5 - b * 0.3
      pitch.rotation.y = t * 0.1
    },
  }
}

/* 5 · Notes: fanned sticky notes */
function notes(): Station {
  const g = new THREE.Group()
  const cols = [0xffd166, 0xffb547, 0xf1ece4, 0x9ad1ff, 0xffd166]
  const ns: THREE.Mesh[] = []
  cols.forEach((c, i) => {
    const geo = new THREE.PlaneGeometry(1.7, 1.7, 10, 10)
    const p = geo.attributes.position
    for (let v = 0; v < p.count; v++) p.setZ(v, Math.pow(Math.max(0, p.getY(v) + 0.2), 2) * 0.12)
    geo.computeVertexNormals()
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, side: THREE.DoubleSide, envMapIntensity: 0.25 }))
    for (let l = 0; l < 3; l++) {
      const ln = new THREE.Mesh(new THREE.PlaneGeometry(1.1 - l * 0.25, 0.05), new THREE.MeshBasicMaterial({ color: 0x2a241c }))
      ln.position.set(-0.15 + l * 0.12, 0.35 - l * 0.3, 0.02)
      m.add(ln)
    }
    m.position.set((i - 2) * 0.55, (i % 2) * 0.25 - 0.1, i * 0.08)
    m.rotation.z = (i - 2) * 0.16
    ns.push(m)
    g.add(m)
  })
  return {
    group: g,
    update: (t) => {
      ns.forEach((m, i) => {
        m.rotation.x = Math.sin(t * 1.1 + i) * 0.12
        m.rotation.y = Math.sin(t * 0.7 + i * 0.6) * 0.25
        m.position.y = (i % 2) * 0.25 - 0.1 + Math.sin(t * 1.3 + i) * 0.08
      })
    },
  }
}

export const STATION_BUILDERS = [monogram, streaming, chat, books, football, notes]

export function createJourney(canvas: HTMLCanvasElement) {
  const isMobile = window.innerWidth < 760
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75)
  renderer.setPixelRatio(dpr)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.setClearColor(0x060709, 1)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x060709, 0.06)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)

  scene.add(new THREE.AmbientLight(0xffffff, 0.15))
  const key = new THREE.DirectionalLight(0xfff1dc, 1.0)
  key.position.set(4, 6, 6)
  scene.add(key)
  const rim = new THREE.PointLight(0xffb547, 7, 40, 2)
  scene.add(rim)

  const stations = STATION_BUILDERS.map((b, i) => {
    const s = b()
    s.group.position.set(0, 0, -i * GAP)
    scene.add(s.group)
    return s
  })

  // dust along the whole flight path
  const DN = isMobile ? 900 : 2200
  const dpos = new Float32Array(DN * 3)
  for (let i = 0; i < DN; i++) dpos.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, 8 - Math.random() * (GAP * stations.length + 16)], i * 3)
  const dgeo = new THREE.BufferGeometry()
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3))
  scene.add(new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.035, transparent: true, opacity: 0.6, depthWrite: false })))

  // floor grid that fades into fog
  const grid = new THREE.GridHelper(60, 60, 0x2a2622, 0x17150f)
  grid.position.set(0, -3.2, -GAP * 2.5)
  grid.scale.z = 3
  scene.add(grid)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), isMobile ? 0.32 : 0.42, 0.45, 0.95)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  let w = 1, h = 1
  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    camera.aspect = w / h
    camera.fov = camera.aspect < 0.8 ? 58 : 42
    camera.updateProjectionMatrix()
  }
  resize()

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
  const onMove = (e: PointerEvent) => { mouse.x = e.clientX / window.innerWidth * 2 - 1; mouse.y = e.clientY / window.innerHeight * 2 - 1 }
  window.addEventListener('pointermove', onMove)

  const clock = new THREE.Clock()
  let progress = 0
  let smooth = 0
  const look = new THREE.Vector3()

  const render = () => {
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime
    smooth += (progress - smooth) * (1 - Math.exp(-dt * 4))
    const f = smooth * (stations.length - 1)
    const narrow = w < 900
    // objects sit to the right on desktop, above the text on narrow screens
    const ox = narrow ? 0 : 2.4
    const oy = narrow ? 1.5 : 0
    stations.forEach((s, i) => {
      s.group.position.x = ox
      s.group.position.y = oy
      const focus = Math.max(0, 1 - Math.abs(f - i))
      s.group.scale.setScalar((narrow ? 0.62 : 1) * (0.7 + focus * 0.3))
      s.update(t, focus)
    })
    const z = -f * GAP
    const sway = Math.sin(f * Math.PI) * 1.4
    mouse.sx += (mouse.x - mouse.sx) * 0.05
    mouse.sy += (mouse.y - mouse.sy) * 0.05
    camera.position.set(sway + mouse.sx * 0.5, 0.6 - mouse.sy * 0.35 + Math.sin(f * Math.PI * 2) * 0.3, z + (narrow ? 10 : 8))
    look.set(narrow ? 0 : 1.2, narrow ? 0.6 : 0, z - 2)
    camera.lookAt(look)
    rim.position.set(ox - 5, 3.5, z + 6)
    grid.position.z = z - 20
    composer.render()
  }

  return {
    render,
    resize,
    setProgress: (p: number) => { progress = p },
    dispose: () => {
      window.removeEventListener('pointermove', onMove)
      renderer.dispose()
    },
  }
}
