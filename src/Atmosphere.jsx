import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

const faceCentre = (x, z) => Math.atan2(-x, -z)

// ── Memory Frames ──────────────────────────────────────────────────────────────
// Mini polaroid photos floating at the room's upper periphery.
// Using Html transform so they're actually visible (unlike AdditiveBlending
// planes which are near-invisible against the dark dome).
const FRAME_DEFS = [
  { a: -2.30, r: 9.0,  y: 3.8, tilt:  5, photo: '/photos/IMG_0225.jpg'  },
  { a:  2.40, r: 9.6,  y: 5.0, tilt: -7, photo: '/photos/IMG_1260.jpg'  },
  { a:  3.05, r: 8.0,  y: 3.0, tilt:  4, photo: '/photos/IMG_3704.JPG'  },
  { a: -0.95, r: 9.8,  y: 5.3, tilt: -4, photo: '/photos/IMG_5015.jpg'  },
  { a:  0.80, r: 9.2,  y: 4.1, tilt:  6, photo: '/photos/IMG_7141.jpg'  },
  { a:  1.58, r: 8.6,  y: 3.5, tilt: -3, photo: '/photos/IMG_8616.jpg'  },
]

function MemoryFrames() {
  const refs  = useRef([])
  const metas = useMemo(() => FRAME_DEFS.map((p, i) => {
    const x = Math.cos(p.a) * p.r
    const z = Math.sin(p.a) * p.r
    return { x, y: p.y, z, ry: faceCentre(x, z), ph: i * 1.31, sp: 0.18 + i * 0.032, tilt: p.tilt, photo: p.photo }
  }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    metas.forEach((m, i) => {
      const g = refs.current[i]
      if (!g) return
      g.position.y = m.y + Math.sin(t * m.sp + m.ph) * 0.22
    })
  })

  return metas.map((m, i) => (
    <group key={i} ref={el => (refs.current[i] = el)} position={[m.x, m.y, m.z]} rotation={[0, m.ry, 0]}>
      <Html transform center distanceFactor={8} zIndexRange={[3, 0]}>
        <div style={{
          width: '88px',
          background: '#f4ecde',
          padding: '6px 6px 26px',
          borderRadius: '2px',
          transform: `rotate(${m.tilt}deg)`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.50)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#b4a898' }}>
            <img src={m.photo} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          </div>
        </div>
      </Html>
    </group>
  ))
}

// ── Balloons ───────────────────────────────────────────────────────────────────
const BALLOON_PALETTE = ['#a78bfa', '#d4af37', '#f3ead2', '#ff9ec4', '#9ad0ff']

function Balloons({ count = 14 }) {
  const refs  = useRef([])
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.6
    const r = 4 + Math.random() * 9
    return {
      x: Math.cos(a) * r, z: Math.sin(a) * r,
      y0: Math.random() * 14,
      sp:    0.45 + Math.random() * 0.55,
      sway:  0.35 + Math.random() * 0.55,
      swaySp: 0.35 + Math.random() * 0.55,
      ph: Math.random() * Math.PI * 2,
      color: BALLOON_PALETTE[i % BALLOON_PALETTE.length],
      scale: 0.85 + Math.random() * 0.5,
    }
  }), [count])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    seeds.forEach((s, i) => {
      const g = refs.current[i]
      if (!g) return
      const y = ((s.y0 + t * s.sp + 2) % 18) - 2
      g.position.set(
        s.x + Math.sin(t * s.swaySp + s.ph) * s.sway,
        y,
        s.z + Math.cos(t * s.swaySp * 0.7 + s.ph) * s.sway * 0.5,
      )
      g.rotation.z = Math.sin(t * s.swaySp + s.ph) * 0.12
    })
  })

  return seeds.map((s, i) => (
    <group key={i} ref={el => (refs.current[i] = el)} position={[s.x, s.y0, s.z]} scale={s.scale}>
      <mesh scale={[1, 1.18, 1]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshPhysicalMaterial
          color={s.color}
          transparent
          opacity={0.82}
          roughness={0.06}
          metalness={0}
          iridescence={0.80}
          iridescenceIOR={1.4}
          emissive={s.color}
          emissiveIntensity={0.06}
        />
      </mesh>
      {/* Knot */}
      <mesh position={[0, -0.26, 0]}>
        <coneGeometry args={[0.04, 0.07, 8]} />
        <meshStandardMaterial color={s.color} roughness={0.35} />
      </mesh>
      {/* String */}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 2.2, 4]} />
        <meshBasicMaterial color="#cbb8ff" transparent opacity={0.45} />
      </mesh>
    </group>
  ))
}

export default function Atmosphere() {
  return (
    <group>
      <MemoryFrames />
      <Balloons />
    </group>
  )
}
