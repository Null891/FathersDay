import { useEffect, useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import LetterPanels from './LetterPanels'
import Atmosphere from './Atmosphere'
import RoomParticles from './RoomParticles'
import Polaroids from './Polaroids'
import Gramophone, { WindChimes } from './Gramophone'
import { roomState } from './roomState'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Head-turn controller — drag to look, full 360° horizontal, limited vertical.
// Damped so movement feels like turning a real head, not snapping.
function RoomLook() {
  const { camera, gl } = useThree()
  const s = useRef({ dragging: false, px: 0, py: 0, yaw: 0, pitch: 0, tYaw: 0, tPitch: 0, velYaw: 0, velPitch: 0 })

  useEffect(() => {
    camera.position.set(0, 1.6, 0)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(0, 0, 0)

    const el = gl.domElement
    const down = (e) => {
      s.current.dragging = true; s.current.px = e.clientX; s.current.py = e.clientY
      el.style.cursor = 'grabbing'
    }
    const up = () => { s.current.dragging = false; el.style.cursor = 'grab' }
    const move = (e) => {
      if (!s.current.dragging) return
      const dx = e.clientX - s.current.px, dy = e.clientY - s.current.py
      s.current.px = e.clientX; s.current.py = e.clientY
      const prevYaw   = s.current.tYaw
      const prevPitch = s.current.tPitch
      s.current.tYaw   = clamp(s.current.tYaw   - dx * 0.0022, -Math.PI, Math.PI)
      s.current.tPitch = clamp(s.current.tPitch - dy * 0.0022, -0.35,    0.60)
      s.current.velYaw   = s.current.tYaw   - prevYaw
      s.current.velPitch = s.current.tPitch - prevPitch
    }
    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointerup',    up)
    window.addEventListener('pointermove',  move)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup',   up)
      window.removeEventListener('pointermove', move)
      el.style.cursor = ''
    }
  }, [camera, gl])

  useFrame((_, dt) => {
    const c = s.current
    // Momentum: continue rotating after release, decaying at 88% per frame
    if (!c.dragging) {
      c.tYaw   = clamp(c.tYaw   + c.velYaw,   -Math.PI, Math.PI)
      c.tPitch = clamp(c.tPitch + c.velPitch, -0.35,    0.60)
      c.velYaw   *= 0.88
      c.velPitch *= 0.88
    }
    roomState.yawVelocity = Math.abs(c.velYaw)
    c.yaw   = THREE.MathUtils.damp(c.yaw,   c.tYaw,   9, dt)
    c.pitch = THREE.MathUtils.damp(c.pitch, c.tPitch, 9, dt)
    camera.rotation.set(c.pitch, c.yaw, 0)
  })

  return null
}

// Procedural wave normal map — two overlapping sine patterns give an organic
// still-water shimmer rather than a uniform ripple.
function useRippleMap() {
  return useMemo(() => {
    const size = 256
    const data = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        const u = x / size, v = y / size
        const nx = (
          Math.sin(u * Math.PI * 8 + 0.3)   * 0.35 +
          Math.sin((u + v) * Math.PI * 12)   * 0.18 +
          Math.cos(v * Math.PI * 10 - 0.7)   * 0.12
        ) * 0.45
        const ny = (
          Math.cos(v * Math.PI * 8 + 1.0)   * 0.35 +
          Math.sin((u - v) * Math.PI * 14)   * 0.18 +
          Math.sin(u * Math.PI * 6 + 2.1)    * 0.12
        ) * 0.45
        const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny))
        data[i]     = Math.round(nx * 127 + 128)
        data[i + 1] = Math.round(ny * 127 + 128)
        data[i + 2] = Math.round(nz * 127 + 128)
        data[i + 3] = 255
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
    tex.needsUpdate = true
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])
}

function RippleFloor() {
  const ripple = useRippleMap()

  useFrame(({ clock }) => {
    ripple.offset.set(
      Math.sin(clock.elapsedTime * 0.07) * 0.10,
      (clock.elapsedTime * 0.012) % 1.0
    )
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        resolution={512}
        blur={[400, 100]}
        mirror={0.6}
        roughness={0.92}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0c0a14"
        metalness={0}
        normalMap={ripple}
        normalScale={[0.05, 0.05]}
      />
    </mesh>
  )
}

// ── Columns ──────────────────────────────────────────────────────────────────
const MARBLE      = { color: '#1b1820', roughness: 0.18, metalness: 0.0 }
const MARBLE_ROUGH = { color: '#191620', roughness: 0.55, metalness: 0.0 }

function Column({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.84, 0.14, 0.84]} />
        <meshStandardMaterial {...MARBLE_ROUGH} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.34, 0.37, 0.22, 16]} />
        <meshStandardMaterial {...MARBLE_ROUGH} />
      </mesh>
      <mesh position={[0, 3.50, 0]}>
        <cylinderGeometry args={[0.24, 0.31, 6.0, 16]} />
        <meshStandardMaterial {...MARBLE} />
      </mesh>
      <mesh position={[0, 6.64, 0]}>
        <cylinderGeometry args={[0.38, 0.25, 0.28, 16]} />
        <meshStandardMaterial {...MARBLE_ROUGH} />
      </mesh>
      <mesh position={[0, 6.83, 0]}>
        <boxGeometry args={[0.84, 0.14, 0.84]} />
        <meshStandardMaterial {...MARBLE_ROUGH} />
      </mesh>
    </group>
  )
}

const COL_R = 8.5
const COL_N = 8

function Columns() {
  const positions = useMemo(() =>
    Array.from({ length: COL_N }, (_, i) => {
      const a = (i / COL_N) * Math.PI * 2
      return [Math.sin(a) * COL_R, 0, Math.cos(a) * COL_R]
    })
  , [])

  return (
    <>
      {positions.map((pos, i) => <Column key={i} position={pos} />)}
      <mesh position={[0, 7.02, 0]}>
        <torusGeometry args={[COL_R, 0.24, 10, 80]} />
        <meshStandardMaterial {...MARBLE_ROUGH} />
      </mesh>
      <mesh position={[0, 7.28, 0]}>
        <torusGeometry args={[COL_R + 0.10, 0.08, 6, 80]} />
        <meshStandardMaterial color="#22202e" roughness={0.4} metalness={0} />
      </mesh>
    </>
  )
}

// ── Star field ────────────────────────────────────────────────────────────────
// Faint points scattered on the inside of the dome, giving depth to the void.
function StarField() {
  const pointsRef = useRef()
  const { geom, mat } = useMemo(() => {
    const COUNT = 650
    const pos   = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 17.6
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 2  // bias above horizon
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      sizes[i]        = 0.04 + Math.random() * 0.10
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos,   3))
    g.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))
    const m = new THREE.PointsMaterial({
      color: '#e8e0ff', size: 0.07, transparent: true, opacity: 0.32,
      toneMapped: false, depthWrite: false, sizeAttenuation: true,
    })
    return { geom: g, mat: m }
  }, [])

  useEffect(() => () => { geom.dispose(); mat.dispose() }, [geom, mat])

  useFrame(({ clock }) => {
    if (pointsRef.current) mat.opacity = 0.28 + Math.sin(clock.elapsedTime * 0.22) * 0.06
  })

  return <points ref={pointsRef} args={[geom, mat]} />
}

// ── Floor Medallion ───────────────────────────────────────────────────────────
// Decorative gold inlay at the room centre — two rings + 8 spokes + centre dot.
function FloorMedallion() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c9a22a', roughness: 0.20, metalness: 0.88,
    emissive: '#a07818', emissiveIntensity: 0.14,
  }), [])

  useEffect(() => () => mat.dispose(), [mat])

  const base = { rotation: [-Math.PI / 2, 0, 0], position: [0, 0.003, 0] }
  const spokes = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      return { x: Math.cos(angle) * 2.1, y: Math.sin(angle) * 2.1, angle }
    })
  , [])

  return (
    <group position={base.position} rotation={base.rotation}>
      <mesh material={mat}>
        <ringGeometry args={[2.82, 3.0, 72]} />
      </mesh>
      <mesh material={mat}>
        <ringGeometry args={[1.40, 1.52, 64]} />
      </mesh>
      <mesh material={mat}>
        <ringGeometry args={[0.52, 0.60, 48]} />
      </mesh>
      {spokes.map((s, i) => (
        <mesh key={i} material={mat} position={[s.x, s.y, 0]} rotation={[0, 0, s.angle]}>
          <boxGeometry args={[0.055, 1.38, 0.003]} />
        </mesh>
      ))}
      {/* 8 small diamond accents at outer ring */}
      {spokes.map((s, i) => (
        <mesh key={`d${i}`} material={mat} position={[Math.cos(s.angle + Math.PI/8) * 2.91, Math.sin(s.angle + Math.PI/8) * 2.91, 0]} rotation={[0, 0, s.angle + Math.PI/4]}>
          <boxGeometry args={[0.08, 0.08, 0.003]} />
        </mesh>
      ))}
    </group>
  )
}

// ── Dome ──────────────────────────────────────────────────────────────────────
function Dome() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[19, 64, 32]} />
        <meshStandardMaterial
          color="#0e0c18"
          emissive="#16132a"
          emissiveIntensity={0.28}
          roughness={0.97}
          metalness={0}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[17.5, 18.0, 8, 48, 1, true]} />
        <meshStandardMaterial color="#0e0c18" roughness={0.95} metalness={0} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 18.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 3.0, 56]} />
        <meshStandardMaterial
          color="#2a1f44"
          emissive="#6040b0"
          emissiveIntensity={0.9}
          roughness={0.5}
          metalness={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 18.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 56]} />
        <meshBasicMaterial color="#06041c" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 18.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.05, 56]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#c8a030"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ── GodRays3D ─────────────────────────────────────────────────────────────────
// Seven additive-blended planes radiating from the oculus, slowly rotating.
// All planes share one material so color only needs updating once per frame.
// Pure 3D approach — no postprocessing GodRays effect, works with existing Bloom.
function GodRays3D() {
  const groupRef  = useRef()
  const coldColor = useMemo(() => new THREE.Color('#7060b0'), [])
  const warmColor = useMemo(() => new THREE.Color('#d49010'), [])

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#7060b0',
    transparent: true,
    opacity: 0.042,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }), [])

  useEffect(() => () => mat.dispose(), [mat])

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0014
    mat.color.lerpColors(coldColor, warmColor, roomState.goldenHourT)
  })

  return (
    <group ref={groupRef} position={[0, 18, 0]}>
      {Array.from({ length: 7 }, (_, i) => {
        const ry  = (i / 7) * Math.PI * 2
        const len = 10 + (i % 3) * 4
        const w   = 0.55 + (i % 2) * 0.65
        return (
          <mesh key={i} position={[0, -len / 2, 0]} rotation={[0, ry, 0.10]} material={mat}>
            <planeGeometry args={[w, len]} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── AnimatedLighting ──────────────────────────────────────────────────────────
// Same uplights as Phase 1 but with refs so golden-hour tween can shift their
// color and intensity as the user scrolls through the letter panels.
function AnimatedLighting() {
  const ambRef  = useRef()
  const upl1    = useRef()
  const upl2    = useRef()
  const upl3    = useRef()
  const moonRef = useRef()

  const coldUplight = useMemo(() => new THREE.Color('#ffa050'), [])
  const warmUplight = useMemo(() => new THREE.Color('#ffd070'), [])
  const coldAmbient = useMemo(() => new THREE.Color('#9090b8'), [])
  const warmAmbient = useMemo(() => new THREE.Color('#c8a060'), [])
  const coldMoon    = useMemo(() => new THREE.Color('#8090cc'), [])
  const warmMoon    = useMemo(() => new THREE.Color('#e0c070'), [])

  useFrame(({ clock }, dt) => {
    const sp = roomState.scrollProgress
    const t  = Math.max(0, (sp - 0.6) / 0.4)
    roomState.goldenHourT = t

    // Subtle breathing on uplights (~1.75 Hz) — simulates ambient music reactivity
    const breathe = Math.sin(clock.elapsedTime * 1.75) * 0.06 + 1.0

    if (ambRef.current) {
      ambRef.current.color.lerpColors(coldAmbient, warmAmbient, t)
      ambRef.current.intensity = THREE.MathUtils.damp(ambRef.current.intensity, 0.05 + t * 0.18, 4, dt)
    }
    if (upl1.current) {
      upl1.current.color.lerpColors(coldUplight, warmUplight, t)
      upl1.current.intensity = (24 + t * 22) * breathe
    }
    if (upl2.current) {
      upl2.current.color.lerpColors(coldUplight, warmUplight, t)
      upl2.current.intensity = (24 + t * 22) * breathe
    }
    if (upl3.current) {
      upl3.current.color.lerpColors(coldUplight, warmUplight, t)
      upl3.current.intensity = (18 + t * 18) * breathe
    }
    if (moonRef.current) {
      moonRef.current.color.lerpColors(coldMoon, warmMoon, t)
      moonRef.current.intensity = THREE.MathUtils.damp(moonRef.current.intensity, 1.2 - t * 0.65, 4, dt)
    }
  })

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.05} color="#9090b8" />

      <pointLight ref={upl1} position={[ 6.0, 0.5, -6.0]} color="#ffa050" intensity={24} distance={15} decay={2} />
      <pointLight ref={upl2} position={[-6.0, 0.5, -6.0]} color="#ffa050" intensity={24} distance={15} decay={2} />
      <pointLight ref={upl3} position={[ 0.0, 0.5, -8.5]} color="#ffb870" intensity={18} distance={12} decay={2} />

      <directionalLight ref={moonRef} position={[0, 18, 0]} color="#8090cc" intensity={1.2} />

      <pointLight position={[0, 5, 9]}    color="#6068a0" intensity={5} distance={18} decay={2} />
      <pointLight position={[ 8.5, 0.5, 0]} color="#ff8840" intensity={8} distance={10} decay={2} />
      <pointLight position={[-8.5, 0.5, 0]} color="#ff8840" intensity={8} distance={10} decay={2} />
    </>
  )
}

export default function GrandRoom({ musicRef }) {
  return (
    <group>
      <RoomLook />
      <AnimatedLighting />
      <GodRays3D />
      <Dome />
      <StarField />
      <FloorMedallion />
      <RippleFloor />
      <Columns />
      <LetterPanels />
      <Atmosphere />
      <RoomParticles />
      <Polaroids />
      <WindChimes />
      <group position={[6.0, 0, -2.5]} rotation={[0, -0.9, 0]}>
        <Gramophone musicRef={musicRef} />
      </group>
    </group>
  )
}
