import { useState, useEffect, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PHOTO_W   = 1.8
const PHOTO_H   = 1.2
const MAT_PAD   = 0.14   // cream "mat" border between photo and frame
const FRAME_PAD = 0.07   // dark frame lip around the mat
const FRAME_D   = 0.06

export default function Exhibit({ textureUrl, position, rotation, quoteText, onQuoteClick }) {
  const texture  = useTexture(textureUrl)
  const [hovered, setHovered] = useState(false)
  const inner = useRef()

  // Photos are viewed at a glancing angle along the wall — anisotropic
  // filtering keeps them crisp; sRGB keeps colours accurate. The photo is also
  // faintly self-lit (emissiveMap) so it reads in the dark gallery and the
  // brightest tones feed the bloom pass.
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  // Damp the hover lift/scale toward its target — costs ~nothing at rest.
  useFrame((_, delta) => {
    const g = inner.current
    if (!g) return
    const s = THREE.MathUtils.damp(g.scale.x, hovered ? 1.045 : 1, 10, delta)
    g.scale.set(s, s, s)
    g.position.z = THREE.MathUtils.damp(g.position.z, hovered ? 0.09 : 0, 10, delta)
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (!onQuoteClick) return
    document.exitPointerLock?.()
    onQuoteClick(quoteText ?? { text: '', date: '' })
  }

  return (
    <group position={position} rotation={rotation}>
      <group ref={inner}>
        {/* Photo plane — self-illuminated so it glows softly in the dark hall */}
        <mesh
          onClick={handleClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <planeGeometry args={[PHOTO_W, PHOTO_H]} />
          <meshStandardMaterial
            map={texture}
            emissiveMap={texture}
            emissive="#ffffff"
            emissiveIntensity={hovered ? 0.55 : 0.38}
            roughness={1}
            toneMapped={false}
          />
        </mesh>

        {/* Cream mat */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[PHOTO_W + MAT_PAD * 2, PHOTO_H + MAT_PAD * 2]} />
          <meshStandardMaterial color="#efe9dd" roughness={0.9} metalness={0} />
        </mesh>

        {/* Frame — warm gilt edge that brightens on hover */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[PHOTO_W + (MAT_PAD + FRAME_PAD) * 2, PHOTO_H + (MAT_PAD + FRAME_PAD) * 2, FRAME_D]} />
          <meshStandardMaterial
            color="#15110b"
            emissive="#d4af37"
            emissiveIntensity={hovered ? 0.5 : 0.12}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
      </group>
    </group>
  )
}
