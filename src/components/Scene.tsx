import { Component, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Html,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  PerformanceMonitor,
  Sparkles,
  Stars,
  Trail,
} from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { Project } from '../useGithubRepos'

type SceneProps = { projects: Project[]; onSelect: (p: Project) => void; progress: MotionValue<number> }

/** Radial falloff texture: round soft particles and the core's glow halo. */
function radialTexture(stops: [number, string][]) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  stops.forEach(([o, col]) => grd.addColorStop(o, col))
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Planet({
  project,
  index,
  total,
  paused,
  low,
  onHover,
  onSelect,
}: {
  project: Project
  index: number
  total: number
  paused: boolean
  low: boolean
  onHover: (name: string | null) => void
  onSelect: (p: Project) => void
}) {
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const radius = 2.4 + index * 0.72
  const speed = 0.32 / (1 + index * 0.3)
  const angle = useRef((index / total) * Math.PI * 2)
  const size = project.featured ? 0.3 : 0.2
  const color = project.color

  useFrame((_, delta) => {
    angle.current += delta * speed * (paused ? 0.08 : 1)
    const a = angle.current
    group.current?.position.set(Math.cos(a) * radius, Math.sin(a * 2) * 0.15, Math.sin(a) * radius)
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.6
      const s = THREE.MathUtils.damp(mesh.current.scale.x, hovered ? 1.6 : 1, 10, delta)
      mesh.current.scale.setScalar(s)
    }
  })

  const body = (
    <mesh ref={mesh}>
      <sphereGeometry args={[size, 48, 48]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.28}
        clearcoat={1}
        clearcoatRoughness={0.15}
        emissive={color}
        emissiveIntensity={hovered ? 1.1 : 0.28}
      />
    </mesh>
  )

  return (
    <>
      {/* orbit path */}
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[radius - 0.007, radius + 0.007, 200]} />
        <meshBasicMaterial
          color={hovered ? '#ff6b3d' : '#f1ece4'}
          transparent
          opacity={hovered ? 0.7 : 0.1}
          toneMapped={false}
        />
      </mesh>

      <group ref={group}>
        {/* Featured projects leave a comet trail along their orbit. */}
        {project.featured && !low ? (
          <Trail width={size * 5} length={5} color={color} attenuation={(t) => t * t} decay={1.2}>
            {body}
          </Trail>
        ) : (
          body
        )}

        {project.featured && (
          <mesh rotation={[Math.PI / 2.4, 0, 0.3]}>
            <ringGeometry args={[size * 1.5, size * 1.9, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        )}

        {/* invisible, larger hit area so small planets are easy to click */}
        <mesh
          onPointerOver={() => {
            setHovered(true)
            onHover(project.name)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            onHover(null)
            document.body.style.cursor = ''
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(project)
          }}
        >
          <sphereGeometry args={[size * 2.4, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {hovered && (
          <Html center position={[0, size + 0.5, 0]} style={{ pointerEvents: 'none' }}>
            <div className="planet-label">
              <strong>{project.title}</strong>
              <span>{project.stack.slice(0, 3).join(' · ')}</span>
            </div>
          </Html>
        )}
      </group>
    </>
  )
}

/** Molten core inside a refractive glass shell. */
function Core({ low }: { low: boolean }) {
  const shell = useRef<THREE.Mesh>(null)
  const halo = useMemo(
    () => radialTexture([[0, 'rgba(255,150,90,0.85)'], [0.25, 'rgba(255,107,61,0.35)'], [1, 'rgba(255,107,61,0)']]),
    [],
  )
  useFrame((state, delta) => {
    if (!shell.current) return
    shell.current.rotation.y += delta * 0.15
    shell.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
  })
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.78, 24]} />
        <MeshDistortMaterial
          color="#ff6b3d"
          emissive="#ff4d1a"
          emissiveIntensity={1.4}
          roughness={0.3}
          distort={0.42}
          speed={2}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.28, 6]} />
        {low ? (
          <meshBasicMaterial color="#ffb38a" wireframe transparent opacity={0.14} toneMapped={false} />
        ) : (
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            thickness={0.6}
            roughness={0.04}
            ior={1.25}
            chromaticAberration={0.08}
            anisotropicBlur={0.2}
            distortion={0.35}
            distortionScale={0.4}
            temporalDistortion={0.12}
            iridescence={1}
            iridescenceIOR={1.3}
            color="#fff4ec"
            backside
          />
        )}
      </mesh>
      {/* Soft halo so the core glows even without the bloom pass. */}
      <sprite scale={low ? 6 : 4.5}>
        <spriteMaterial map={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <pointLight intensity={70} color="#ffb38a" distance={22} />
    </group>
  )
}

/** Particle accretion disc around the core: dense and hot near the centre, sparse and cool outside. */
function Disc({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const dot = useMemo(() => radialTexture([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]), [])
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const inner = new THREE.Color('#ffd166')
    const mid = new THREE.Color('#ff6b3d')
    const outer = new THREE.Color('#5a3a2c')
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const t = Math.pow(Math.random(), 1.8)
      const r = 1.6 + t * 8.6
      const a = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.18 * (1 + t * 2)
      positions[i * 3 + 2] = Math.sin(a) * r
      if (t < 0.4) c.copy(inner).lerp(mid, t / 0.4)
      else c.copy(mid).lerp(outer, (t - 0.4) / 0.6)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    return { positions, colors }
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.04
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        map={dot}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

// Camera flight through the hero: wide → skimming the orbit plane → close pass → top-down overview.
const CAM = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 3.6, 10.5),
    new THREE.Vector3(7.2, 1.5, 6.4),
    new THREE.Vector3(3.4, 0.55, 3.9),
    new THREE.Vector3(-1.5, 8.5, 4.2),
    new THREE.Vector3(0, 12.5, 0.6),
  ],
  false,
  'centripetal',
)
const LOOK = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(-0.8, 0.3, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ],
  false,
  'centripetal',
)

function CameraRig({ progress }: { progress: MotionValue<number> }) {
  const { camera, size, scene } = useThree()
  const p = useRef(0)
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    p.current = THREE.MathUtils.damp(p.current, progress.get(), 4, delta)
    // Pull back on narrow/portrait screens so the orbits aren't cropped.
    const k = Math.min(1.9, Math.max(1, size.height / size.width))
    CAM.getPoint(p.current, pos).multiplyScalar(k)
    LOOK.getPoint(p.current, look)
    pos.x += state.pointer.x * 0.7
    pos.y += state.pointer.y * 0.4
    camera.position.lerp(pos, 1 - Math.exp(-delta * 6))
    camera.lookAt(look)
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = 10 * k
      scene.fog.far = 30 * k
    }
  })
  return null
}

/** Slowly turns the whole system unless a planet is hovered. */
function Spin({ paused, children }: { paused: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current && !paused) ref.current.rotation.y += delta * 0.03
  })
  return <group ref={ref}>{children}</group>
}

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <div className="scene-fallback" /> : this.props.children
  }
}

export default function Scene({ projects, onSelect, progress }: SceneProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const isTouch = useMemo(() => window.matchMedia('(pointer: coarse)').matches, [])
  // Phones start in the lighter mode; desktops drop to it if the frame rate falls.
  const [low, setLow] = useState(isTouch)
  const [dpr, setDpr] = useState(isTouch ? 1.25 : 1.75)

  return (
    <WebGLBoundary>
      <Canvas
        className="scene"
        camera={{ position: [0, 3.6, 10.5], fov: 50 }}
        dpr={dpr}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        style={{ touchAction: 'pan-y' }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setLow(true)
            setDpr(1)
          }}
        />
        <color attach="background" args={['#0b0a09']} />
        <fog attach="fog" args={['#0b0a09', 12, 30]} />
        <CameraRig progress={progress} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 8, 5]} intensity={0.7} />

        <Spin paused={hovered !== null}>
          <Core low={low} />
          <Disc count={low ? 1800 : 5000} />
          {projects.map((p, i) => (
            <Planet
              key={p.name}
              project={p}
              index={i}
              total={projects.length}
              paused={hovered !== null}
              low={low}
              onHover={setHovered}
              onSelect={onSelect}
            />
          ))}
          <Sparkles count={70} scale={14} size={2.2} speed={0.3} color="#ffd166" opacity={0.6} />
        </Spin>
        <Stars radius={70} depth={45} count={low ? 1500 : 3000} factor={3} fade speed={0.6} />

        {!low && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.3} />
            <Vignette offset={0.25} darkness={0.75} />
          </EffectComposer>
        )}
      </Canvas>
    </WebGLBoundary>
  )
}
