import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { BACK_Z } from './constants'

// The portal sits just in front of the end wall. The player approaches from
// +Z walking toward -Z, so the portal faces them with no rotation needed.
const PORTAL_Z = BACK_Z + 0.4
const NEAR_DIST = 7     // show the prompt within this many units
const STEP_DIST = 1.9   // auto-step-through once this close (the "walk into it")

export default function Checkpoint({ onTrigger, active }) {
  const { camera } = useThree()
  const ring    = useRef()
  const surface = useRef()
  const glow    = useRef()
  const [near, setNear] = useState(false)
  const nearRef  = useRef(false)
  const firedRef = useRef(false)

  // Pulse the portal + detect proximity / auto-step-through.
  useFrame(({ clock }) => {
    const p = (Math.sin(clock.elapsedTime * 1.6) + 1) / 2 // 0..1
    if (surface.current) surface.current.material.opacity = 0.32 + p * 0.30
    if (ring.current)    ring.current.material.emissiveIntensity = 1.6 + p * 1.3
    if (glow.current)    glow.current.intensity = 6 + p * 5

    if (!active || firedRef.current) return
    const dist = Math.abs(camera.position.z - PORTAL_Z)
    const isNear = dist < NEAR_DIST
    if (isNear !== nearRef.current) { nearRef.current = isNear; setNear(isNear) }
    if (dist < STEP_DIST) { firedRef.current = true; onTrigger?.() }
  })

  // Press E / Enter while near to step through.
  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if ((e.code === 'KeyE' || e.code === 'Enter') && nearRef.current && !firedRef.current) {
        firedRef.current = true
        onTrigger?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onTrigger])

  const handleClick = (e) => {
    e.stopPropagation()
    if (firedRef.current) return
    firedRef.current = true
    onTrigger?.()
  }

  return (
    <group position={[0, 1.6, PORTAL_Z]}>
      {/* Light the end wall around the portal */}
      <pointLight ref={glow} position={[0, 0, 1.2]} intensity={8} distance={11} decay={2} color="#b794ff" />

      {/* Outer gilded ring */}
      <mesh ref={ring}>
        <torusGeometry args={[1.3, 0.07, 24, 90]} />
        <meshStandardMaterial color="#1a1030" emissive="#a855f7" emissiveIntensity={2} roughness={0.3} metalness={0.6} toneMapped={false} />
      </mesh>

      {/* Shimmering portal surface — the click target */}
      <mesh ref={surface} position={[0, 0, -0.03]} onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}>
        <circleGeometry args={[1.27, 64]} />
        <meshBasicMaterial color="#caa9ff" transparent opacity={0.45} side={THREE.DoubleSide}
          toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Floor reflection glow under the portal */}
      <pointLight position={[0, -1.5, 0.5]} intensity={4} distance={6} decay={2} color="#7c3aed" />

      {/* Approach prompt */}
      {near && (
        <Html position={[0, -1.95, 0.2]} center distanceFactor={9} pointerEvents="none">
          <div style={{
            whiteSpace: 'nowrap',
            padding: '10px 22px', borderRadius: '999px',
            background: 'rgba(20,14,38,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(167,139,250,0.35)',
            boxShadow: '0 0 30px rgba(124,58,237,0.4)',
            color: 'rgba(255,255,255,0.92)', fontFamily: 'system-ui, sans-serif',
            fontSize: '15px', letterSpacing: '0.06em', userSelect: 'none',
          }}>
            Step through — press <b style={{ color: '#c9a8ff' }}>E</b> or click
          </div>
        </Html>
      )}
    </group>
  )
}
