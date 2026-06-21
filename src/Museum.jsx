import { Suspense, Fragment } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import Exhibit from './Exhibit'
import Pedestal from './Pedestal'
import DustMotes from './DustMotes'
import { PHOTOS, CAPTIONS, thumbUrl } from './photos'
import { HALL_WIDTH, HALL_HEIGHT, HALL_LENGTH, CENTER_Z, BACK_Z, FRONT_Z } from './constants'

// Photo bays: 2 photos per z-slot, one on each wall
const BAY_SPACING  = 3.5
const BAY_START_Z  = -3
const bays = PHOTOS.reduce((acc, src, i) => {
  const bay = Math.floor(i / 2)
  if (!acc[bay]) acc[bay] = { z: BAY_START_Z - bay * BAY_SPACING, left: null, right: null, leftCaption: null, rightCaption: null }
  if (i % 2 === 0) { acc[bay].left = src;  acc[bay].leftCaption  = CAPTIONS[src] ?? { text: '', date: '' } }
  else             { acc[bay].right = src; acc[bay].rightCaption = CAPTIONS[src] ?? { text: '', date: '' } }
  return acc
}, [])

// Warm gallery lights: one every 12 units down the hall
const lightZs = Array.from(
  { length: Math.ceil(HALL_LENGTH / 12) },
  (_, i) => BAY_START_Z - i * 12,
)

// Dark, premium-museum palette — deep charcoal walls so the lit, faintly
// glowing photos pop and the bloom/vignette grade has somewhere to fall off.
const wallMat    = { color: '#16141c', roughness: 0.92, metalness: 0 }
const ceilingMat = { color: '#0d0b11', roughness: 1,    metalness: 0 }

export default function Museum({ onExhibitClick }) {
  return (
    <group>
      {/* Lighting — low warm fill + pooled ceiling lights */}
      <ambientLight intensity={0.16} color="#bfb8d8" />
      <hemisphereLight args={['#3a3550', '#08070c', 0.28]} />
      {lightZs.map((z, i) => (
        <pointLight
          key={i}
          position={[0, HALL_HEIGHT - 0.3, z]}
          intensity={26}
          distance={18}
          decay={2}
          color="#ffe6bd"
        />
      ))}
      {/* Warm welcome glow at the entrance */}
      <pointLight position={[0, HALL_HEIGHT - 0.6, FRONT_Z - 2]} intensity={20} distance={14} decay={2} color="#ffd59a" />

      {/* Reflective polished floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, CENTER_Z]}>
        <planeGeometry args={[HALL_WIDTH, HALL_LENGTH]} />
        <MeshReflectorMaterial
          resolution={256}
          mixBlur={1}
          mixStrength={1.4}
          blur={[300, 90]}
          roughness={0.85}
          depthScale={1}
          minDepthThreshold={0.85}
          maxDepthThreshold={1}
          color="#0a0a10"
          metalness={0.55}
          mirror={0.45}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HALL_HEIGHT, CENTER_Z]}>
        <planeGeometry args={[HALL_WIDTH, HALL_LENGTH]} />
        <meshStandardMaterial {...ceilingMat} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-(HALL_WIDTH / 2), HALL_HEIGHT / 2, CENTER_Z]}>
        <boxGeometry args={[0.15, HALL_HEIGHT, HALL_LENGTH]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* Right wall */}
      <mesh position={[HALL_WIDTH / 2, HALL_HEIGHT / 2, CENTER_Z]}>
        <boxGeometry args={[0.15, HALL_HEIGHT, HALL_LENGTH]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* End wall */}
      <mesh position={[0, HALL_HEIGHT / 2, BACK_Z]}>
        <boxGeometry args={[HALL_WIDTH, HALL_HEIGHT, 0.15]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* Drifting dust in the light */}
      <DustMotes />

      {/* All photo exhibits */}
      {bays.map(({ z, left, right, leftCaption, rightCaption }, i) => (
        <Fragment key={i}>
          {left && (
            <Suspense fallback={null}>
              <Exhibit
                textureUrl={thumbUrl(left)}
                position={[-HALL_WIDTH / 2 + 0.1, HALL_HEIGHT / 2, z]}
                rotation={[0, Math.PI / 2, 0]}
                quoteText={leftCaption}
                onQuoteClick={onExhibitClick}
              />
            </Suspense>
          )}
          {right && (
            <Suspense fallback={null}>
              <Exhibit
                textureUrl={thumbUrl(right)}
                position={[HALL_WIDTH / 2 - 0.1, HALL_HEIGHT / 2, z]}
                rotation={[0, -Math.PI / 2, 0]}
                quoteText={rightCaption}
                onQuoteClick={onExhibitClick}
              />
            </Suspense>
          )}
        </Fragment>
      ))}

      {/* Letter pedestal at the end */}
      <Pedestal position={[0, 0, BACK_Z + 4]} />
    </group>
  )
}
