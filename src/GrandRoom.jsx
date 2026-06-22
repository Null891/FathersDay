import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import LetterPanels from './LetterPanels'
import Atmosphere from './Atmosphere'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Stand-in-place look controller: drag empty space to turn your head.
// Yaw is clamped to ±112° (≈224° of sweep, comfortably past the 180° ask),
// pitch is gently limited. The wheel is left untouched so it scrolls the
// reading panels. Position is fixed at room centre.
function RoomLook() {
  const { camera, gl } = useThree()
  const s = useRef({ dragging: false, px: 0, py: 0, yaw: 0, pitch: 0, tYaw: 0, tPitch: 0 })

  useEffect(() => {
    camera.position.set(0, 1.6, 0)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(0, 0, 0)

    const el = gl.domElement
    const down = (e) => { s.current.dragging = true; s.current.px = e.clientX; s.current.py = e.clientY; el.style.cursor = 'grabbing' }
    const up   = () => { s.current.dragging = false; el.style.cursor = 'grab' }
    const move = (e) => {
      if (!s.current.dragging) return
      const dx = e.clientX - s.current.px, dy = e.clientY - s.current.py
      s.current.px = e.clientX; s.current.py = e.clientY
      s.current.tYaw   = clamp(s.current.tYaw   - dx * 0.0026, -1.95, 1.95)
      s.current.tPitch = clamp(s.current.tPitch - dy * 0.0026, -0.5, 0.5)
    }
    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointermove', move)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointermove', move)
      el.style.cursor = ''
    }
  }, [camera, gl])

  useFrame((_, dt) => {
    const c = s.current
    c.yaw   = THREE.MathUtils.damp(c.yaw,   c.tYaw,   9, dt)
    c.pitch = THREE.MathUtils.damp(c.pitch, c.tPitch, 9, dt)
    camera.rotation.set(c.pitch, c.yaw, 0)
  })

  return null
}

export default function GrandRoom() {
  return (
    <group>
      <RoomLook />

      {/* Airy ambient + warm overhead key + soft violet fill */}
      <ambientLight intensity={0.5} color="#c8c0e8" />
      <hemisphereLight args={['#b9a8ff', '#241d3a', 0.6]} />
      <pointLight position={[0, 8.5, 0]} intensity={45} distance={42} decay={2} color="#ffe6c0" />
      <pointLight position={[0, 3, -7]} intensity={16} distance={22} decay={2} color="#a78bfa" />

      {/* Dome — inverted sphere, softly self-lit so it reads as open sky */}
      <mesh>
        <sphereGeometry args={[19, 48, 32]} />
        <meshStandardMaterial color="#241f3c" emissive="#3a3160" emissiveIntensity={0.45} roughness={1} metalness={0} side={THREE.BackSide} />
      </mesh>

      {/* Floor disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[19, 80]} />
        <meshStandardMaterial color="#191530" roughness={0.65} metalness={0.25} />
      </mesh>

      {/* Soft halo ring on the floor, centring the space */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[5.6, 6.0, 96]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.18} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* The letter — three theme-split reading panels + floating header */}
      <LetterPanels />

      {/* Drifting memory orbs, balloons, frames, ambient dust */}
      <Atmosphere />
    </group>
  )
}
