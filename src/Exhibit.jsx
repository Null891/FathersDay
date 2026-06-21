import { useState } from 'react'
import { useTexture } from '@react-three/drei'

const PHOTO_W   = 1.8
const PHOTO_H   = 1.2
const FRAME_PAD = 0.1
const FRAME_D   = 0.05

export default function Exhibit({ textureUrl, position, rotation, quoteText, onQuoteClick }) {
  const texture  = useTexture(textureUrl)
  const [hovered, setHovered] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    if (!onQuoteClick) return
    document.exitPointerLock?.()
    onQuoteClick(quoteText ?? '')
  }

  return (
    <group position={position} rotation={rotation}>
      {/* Photo plane */}
      <mesh
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <planeGeometry args={[PHOTO_W, PHOTO_H]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Frame — glows subtly on hover */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[PHOTO_W + FRAME_PAD * 2, PHOTO_H + FRAME_PAD * 2, FRAME_D]} />
        <meshStandardMaterial
          color={hovered ? '#1a0a2e' : '#111111'}
          emissive="#7c3aed"
          emissiveIntensity={hovered ? 0.5 : 0}
          roughness={0.6}
        />
      </mesh>
    </group>
  )
}
