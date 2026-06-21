import { Suspense, Fragment } from 'react'
import Exhibit from './Exhibit'
import Pedestal from './Pedestal'
import { PHOTOS, CAPTIONS } from './photos'

// Hallway dimensions — long enough for all photos, 2 per bay
const HALL_WIDTH  = 6
const HALL_HEIGHT = 4
const HALL_LENGTH = 160
const HALL_HALF_Z = HALL_LENGTH / 2
const CENTER_Z    = -(HALL_HALF_Z - 2)   // -78
const BACK_Z      = CENTER_Z - HALL_HALF_Z + 2  // -156

// Photo bays: 2 photos per z-slot, one on each wall
const BAY_SPACING  = 3.5
const BAY_START_Z  = -3
const bays = PHOTOS.reduce((acc, src, i) => {
  const bay = Math.floor(i / 2)
  if (!acc[bay]) acc[bay] = { z: BAY_START_Z - bay * BAY_SPACING, left: null, right: null, leftCaption: '', rightCaption: '' }
  if (i % 2 === 0) { acc[bay].left = src;  acc[bay].leftCaption  = CAPTIONS[src] ?? '' }
  else             { acc[bay].right = src; acc[bay].rightCaption = CAPTIONS[src] ?? '' }
  return acc
}, [])

// Gallery lights: one every 12 units down the hall
const lightZs = Array.from(
  { length: Math.ceil(HALL_LENGTH / 12) },
  (_, i) => BAY_START_Z - i * 12,
)

const floorMat = { color: '#d1c9be', roughness: 0.4, metalness: 0.1 }
const wallMat  = { color: '#f0ece6', roughness: 0.8, metalness: 0 }

export default function Museum({ onExhibitClick }) {
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      {lightZs.map((z, i) => (
        <pointLight
          key={i}
          position={[0, HALL_HEIGHT - 0.3, z]}
          intensity={22}
          distance={16}
          decay={2}
          color="#fff5e0"
        />
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, CENTER_Z]}>
        <planeGeometry args={[HALL_WIDTH, HALL_LENGTH]} />
        <meshStandardMaterial {...floorMat} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HALL_HEIGHT, CENTER_Z]}>
        <planeGeometry args={[HALL_WIDTH, HALL_LENGTH]} />
        <meshStandardMaterial {...wallMat} />
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

      {/* All photo exhibits */}
      {bays.map(({ z, left, right, leftCaption, rightCaption }, i) => (
        <Fragment key={i}>
          {left && (
            <Suspense fallback={null}>
              <Exhibit
                textureUrl={left}
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
                textureUrl={right}
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
