import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const faceCentre = (x, z) => Math.atan2(-x, -z)

/* ── Memory frames ────────────────────────────────────────────────────────
   Faint glowing photo-frame placeholders at the room periphery. */
function MemoryFrames() {
  const refs = useRef([])
  const frames = useMemo(() => ([
    { a: -2.3, r: 9.5,  y: 4.6 },
    { a:  2.4, r: 10.5, y: 5.6 },
    { a:  3.05, r: 8.5, y: 3.4 },
    { a: -0.95, r: 11,  y: 6.3 },
  ].map((p, i) => {
    const x = Math.cos(p.a) * p.r, z = Math.sin(p.a) * p.r
    return {
      x, y: p.y, z, ry: faceCentre(x, z),
      color: ['#e7dcff', '#ffe6c2', '#cdbcff', '#f8eed6'][i],
      ph: Math.random() * Math.PI * 2, sp: 0.2 + Math.random() * 0.2,
    }
  })), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    frames.forEach((f, i) => {
      const g = refs.current[i]; if (!g) return
      g.position.y = f.y + Math.sin(t * f.sp + f.ph) * 0.35
      g.rotation.z = Math.sin(t * f.sp * 0.7 + f.ph) * 0.06
    })
  })

  return frames.map((f, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)} position={[f.x, f.y, f.z]} rotation={[0, f.ry, 0]}>
      <mesh>
        <planeGeometry args={[0.8, 1.0]} />
        <meshBasicMaterial color={f.color} transparent opacity={0.45} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.64, 0.84]} />
        <meshBasicMaterial color="#16111f" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  ))
}

/* ── Balloons ─────────────────────────────────────────────────────────────
   Iridescent MeshPhysicalMaterial — no transmission pass, just iridescence
   (thin-film interference). Longer strings (2.2 units) read more natural at
   room scale. */
const BALLOON_PALETTE = ['#a78bfa', '#d4af37', '#f3ead2', '#ff9ec4', '#9ad0ff']

function Balloons({ count = 12 }) {
  const refs = useRef([])
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => {
    const a = Math.random() * Math.PI * 2
    const r = 5 + Math.random() * 8
    return {
      x: Math.cos(a) * r, z: Math.sin(a) * r, y0: Math.random() * 16 - 2,
      sp: 0.5 + Math.random() * 0.5, sway: 0.4 + Math.random() * 0.6,
      swaySp: 0.4 + Math.random() * 0.6, ph: Math.random() * Math.PI * 2,
      color: BALLOON_PALETTE[i % BALLOON_PALETTE.length], scale: 0.8 + Math.random() * 0.5,
    }
  }), [count])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    seeds.forEach((s, i) => {
      const g = refs.current[i]; if (!g) return
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
    <group key={i} ref={(el) => (refs.current[i] = el)} position={[s.x, s.y0, s.z]} scale={s.scale}>
      {/* Balloon envelope — iridescent physical material */}
      <mesh scale={[1, 1.18, 1]}>
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshPhysicalMaterial
          color={s.color}
          transparent
          opacity={0.70}
          roughness={0.06}
          metalness={0}
          iridescence={0.55}
          iridescenceIOR={1.3}
        />
      </mesh>
      {/* Knot */}
      <mesh position={[0, -0.26, 0]}>
        <coneGeometry args={[0.04, 0.07, 8]} />
        <meshStandardMaterial color={s.color} roughness={0.35} />
      </mesh>
      {/* String — extended to 2.2 units for better room-scale proportion */}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 2.2, 4]} />
        <meshBasicMaterial color="#cbb8ff" transparent opacity={0.4} />
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
