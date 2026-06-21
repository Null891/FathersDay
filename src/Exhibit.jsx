import { useTexture } from '@react-three/drei'

const PHOTO_W = 1.8
const PHOTO_H = 1.2
const FRAME_PAD = 0.1
const FRAME_DEPTH = 0.05

export default function Exhibit({ imageUrl, position, rotation }) {
  const texture = useTexture(imageUrl)

  return (
    <group position={position} rotation={rotation}>
      {/* Photo */}
      <mesh>
        <planeGeometry args={[PHOTO_W, PHOTO_H]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* Frame — sits 0.015 behind the photo surface */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[PHOTO_W + FRAME_PAD * 2, PHOTO_H + FRAME_PAD * 2, FRAME_DEPTH]} />
        <meshStandardMaterial color="#111111" roughness={0.6} />
      </mesh>
    </group>
  )
}
