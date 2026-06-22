import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { roomState } from './roomState'

// ── Web Audio singleton for chime synthesis ───────────────────────────────────
// OscillatorNode approach: no audio files needed.
let _audioCtx = null
const getAudioCtx = () => {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return _audioCtx
}

// Pentatonic scale: C5, E5, G5, C6, E6 — universally pleasant for chimes
const CHIME_FREQS = [523.25, 659.25, 783.99, 1046.50, 1318.51]

function playChime(velocityMag) {
  try {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const freq   = CHIME_FREQS[Math.floor(Math.random() * CHIME_FREQS.length)]
    const vol    = Math.min(0.22, 0.08 + velocityMag * 18)
    const osc    = ctx.createOscillator()
    const gain   = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.95)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.95)
  } catch { /* AudioContext blocked on some browsers — silently ignore */ }
}

// ── WindChimes ────────────────────────────────────────────────────────────────
// Invisible component that reads roomState.yawVelocity every frame.
// Plays a synthesized chime when the camera is flicked, with a cooldown
// so rapid movement produces a natural sequence rather than noise.
export function WindChimes() {
  const lastChimeRef = useRef(0)
  const THRESHOLD    = 0.0035   // rad/frame minimum to trigger
  const COOLDOWN_MS  = 580      // minimum gap between chimes

  useFrame(() => {
    const v = roomState.yawVelocity
    if (v < THRESHOLD) return
    const now = Date.now()
    if (now - lastChimeRef.current < COOLDOWN_MS) return
    lastChimeRef.current = now
    playChime(v)
  })

  return null
}

// ── Material presets ──────────────────────────────────────────────────────────
const WOOD  = { color: '#3a2218', roughness: 0.80, metalness: 0.0 }
const VINYL = { color: '#191410', roughness: 0.55, metalness: 0.10 }
const BRASS = { color: '#b89020', roughness: 0.35, metalness: 0.82, emissive: '#806010', emissiveIntensity: 0.10 }
const GOLD  = { color: '#c9a22a', roughness: 0.22, metalness: 0.92 }
const DARK  = { color: '#2a2420', roughness: 0.65, metalness: 0.50 }

// ── Gramophone ────────────────────────────────────────────────────────────────
// Built entirely from Three.js primitives — no model file required.
// Clicking the cabinet calls musicRef.current.toggle() (play / pause).
// The platter always spins at LP speed (0.85 rad/s) — decorative.
export default function Gramophone({ musicRef }) {
  const platRef = useRef()

  useFrame((_, dt) => {
    if (platRef.current) platRef.current.rotation.y += dt * 0.85
  })

  const onClickCabinet = (e) => {
    e.stopPropagation()
    musicRef?.current?.toggle?.()
  }

  return (
    <group>
      {/* ── Cabinet / base ──────────────────────────────────────── */}
      <mesh position={[0, 0.16, 0]} onClick={onClickCabinet}>
        <boxGeometry args={[0.50, 0.32, 0.44]} />
        <meshStandardMaterial {...WOOD} />
      </mesh>

      {/* Gold trim band around cabinet top */}
      <mesh position={[0, 0.325, 0]}>
        <boxGeometry args={[0.502, 0.022, 0.442]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* ── Platter group (rotates) ──────────────────────────────── */}
      <group ref={platRef} position={[0.02, 0.345, 0.02]}>
        {/* Vinyl disk */}
        <mesh>
          <cylinderGeometry args={[0.20, 0.20, 0.030, 32]} />
          <meshStandardMaterial {...VINYL} />
        </mesh>
        {/* Groove rings on platter surface */}
        {[0.105, 0.158].map((r, i) => (
          <mesh key={i} position={[0, 0.017, 0]}>
            <torusGeometry args={[r, 0.005, 4, 48]} />
            <meshStandardMaterial color="#100e0c" roughness={0.95} metalness={0} />
          </mesh>
        ))}
        {/* Center label — small red disk */}
        <mesh position={[0, 0.018, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.004, 24]} />
          <meshStandardMaterial color="#8b1010" roughness={0.70} emissive="#440808" emissiveIntensity={0.28} />
        </mesh>
        {/* Spindle */}
        <mesh position={[0, 0.062, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.068, 8]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      </group>

      {/* ── Tone arm post ────────────────────────────────────────── */}
      <mesh position={[0.22, 0.455, -0.18]}>
        <cylinderGeometry args={[0.013, 0.013, 0.225, 8]} />
        <meshStandardMaterial {...DARK} />
      </mesh>

      {/* ── Tone arm sweeping toward platter center ──────────────── */}
      <group position={[0.22, 0.57, -0.18]} rotation={[0, -1.08, 0]}>
        <mesh position={[0, 0, 0.19]}>
          <boxGeometry args={[0.016, 0.016, 0.38]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        {/* Cartridge head at arm end */}
        <mesh position={[0, -0.010, 0.38]}>
          <boxGeometry args={[0.028, 0.020, 0.036]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
      </group>

      {/* ── Horn tube (tapered cylinder connecting cabinet to bell) ─ */}
      <mesh position={[-0.05, 0.66, 0.10]} rotation={[0.48, 0.72, -0.18]}>
        <cylinderGeometry args={[0.024, 0.052, 0.44, 12]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>

      {/* ── Horn bell (open cone) ────────────────────────────────── */}
      <group position={[-0.24, 1.08, 0.36]} rotation={[-0.60, 0.85, 0.10]}>
        <mesh>
          <coneGeometry args={[0.48, 0.80, 32, 1, true]} />
          <meshStandardMaterial {...BRASS} side={THREE.DoubleSide} />
        </mesh>
        {/* Bell rim ring — catches the light */}
        <mesh position={[0, -0.400, 0]}>
          <torusGeometry args={[0.480, 0.022, 8, 48]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      </group>

      {/* ── Small uplight at base (makes the horn glow) ─────────── */}
      <pointLight
        position={[-0.24, 0.40, 0.36]}
        color="#e0a020"
        intensity={2.5}
        distance={2.2}
        decay={2}
      />

      {/* ── Interaction hint ─────────────────────────────────────── */}
      <group position={[0, -0.04, 0.30]} rotation={[0, 0.9, 0]}>
        <Html transform center distanceFactor={6} zIndexRange={[25, 0]}>
          <p style={{
            margin: 0,
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(201,162,42,0.55)',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}>
            click · play / pause
          </p>
        </Html>
      </group>
    </group>
  )
}
