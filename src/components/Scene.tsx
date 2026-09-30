import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html, MeshDistortMaterial, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { Project } from '../useGithubRepos'

type SceneProps = { projects: Project[]; onSelect: (p: Project) => void }

function Planet({
  project,
  index,
  total,
  paused,
  onHover,
  onSelect,
}: {
  project: Project
  index: number
  total: number
  paused: boolean
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
      const s = THREE.MathUtils.lerp(mesh.current.scale.x, hovered ? 1.6 : 1, 0.15)
      mesh.current.scale.setScalar(s)
    }
  })

  return (
    <>
      {/* orbit path */}
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[radius - 0.006, radius + 0.006, 160]} />
        <meshBasicMaterial color={hovered ? '#ff6b3d' : '#f1ece4'} transparent opacity={hovered ? 0.5 : 0.08} />
      </mesh>

      <group ref={group}>
        <mesh ref={mesh}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.45} emissive={color} emissiveIntensity={hovered ? 0.6 : 0.15} />
        </mesh>

        {project.featured && (
          <mesh rotation={[Math.PI / 2.4, 0, 0.3]}>
            <ringGeometry args={[size * 1.5, size * 1.9, 48]} />
            <meshBasicMaterial color={color} transparent opacity={0.45} side={THREE.DoubleSide} />
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
          <sphereGeometry args={[size * 2.2, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {hovered && (
          <Html center position={[0, size + 0.45, 0]} style={{ pointerEvents: 'none' }}>
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

function Core() {
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.6}>
      <mesh>
        <icosahedronGeometry args={[1.05, 24]} />
        <MeshDistortMaterial
          color="#ff6b3d"
          emissive="#ff4d1a"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.1}
          distort={0.38}
          speed={1.8}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ff6b3d" transparent opacity={0.06} />
      </mesh>
    </Float>
  )
}

/** Tilts and pushes the system toward the camera as the user scrolls past the hero. */
function ScrollRig({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!ref.current) return
    const p = Math.min(window.scrollY / window.innerHeight, 1)
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, p * 5, 0.1)
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, p * 0.6, 0.1)
  })
  return <group ref={ref}>{children}</group>
}

/** Pulls the camera back on narrow/portrait screens so the orbits aren't cropped. */
function ResponsiveCamera() {
  const { camera, size, scene } = useThree()
  useEffect(() => {
    const aspect = size.width / size.height
    const dist = 11.1 * Math.min(1.9, Math.max(1, 1 / aspect))
    camera.position.setLength(dist)
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = dist + 1
      scene.fog.far = dist + 16
    }
  }, [camera, scene, size.width, size.height])
  return null
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

export default function Scene({ projects, onSelect }: SceneProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const isTouch = useMemo(() => window.matchMedia('(pointer: coarse)').matches, [])
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  return (
    <WebGLBoundary>
      <Canvas
        className="scene"
        camera={{ position: [0, 3.6, 10.5], fov: 50 }}
        dpr={[1, 1.75]}
        style={{ touchAction: 'pan-y' }}
      >
        <color attach="background" args={['#0b0a09']} />
        <fog attach="fog" args={['#0b0a09', 12, 26]} />
        <ResponsiveCamera />
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 0, 0]} intensity={60} color="#ffb38a" distance={20} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} />

        <ScrollRig>
          <Core />
          {projects.map((p, i) => (
            <Planet
              key={p.name}
              project={p}
              index={i}
              total={projects.length}
              paused={hovered !== null}
              onHover={setHovered}
              onSelect={onSelect}
            />
          ))}
          <Sparkles count={60} scale={12} size={2} speed={0.3} color="#ffd166" opacity={0.5} />
        </ScrollRig>
        <Stars radius={60} depth={40} count={2500} factor={3} fade speed={0.6} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={!isTouch}
          autoRotate={!reduced && hovered === null}
          autoRotateSpeed={0.35}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>
    </WebGLBoundary>
  )
}
