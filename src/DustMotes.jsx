import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HALL_HEIGHT, BACK_Z, FRONT_Z, MIN_X, MAX_X } from './constants'

const COUNT = 220

// Slow-drifting dust caught in the gallery light — pure atmosphere.
// One BufferGeometry of points, animated on the CPU (cheap at this count),
// with a soft round sprite generated in-memory so there's no asset to load.
export default function DustMotes() {
  const ref = useRef()

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = THREE.MathUtils.lerp(MIN_X, MAX_X, Math.random())
      positions[i * 3 + 1] = Math.random() * (HALL_HEIGHT - 0.4) + 0.2
      positions[i * 3 + 2] = THREE.MathUtils.lerp(BACK_Z, FRONT_Z, Math.random())
      speeds[i] = 0.04 + Math.random() * 0.10
    }
    return { positions, speeds }
  }, [])

  const sprite = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,246,224,1)')
    grad.addColorStop(0.4, 'rgba(255,240,210,0.45)')
    grad.addColorStop(1, 'rgba(255,240,210,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useFrame((_, delta) => {
    const geo = ref.current
    if (!geo) return
    const arr = geo.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      const yi = i * 3 + 1
      arr[yi] += speeds[i] * delta              // drift upward
      arr[i * 3] += Math.sin(arr[yi] * 0.6 + i) * delta * 0.04  // gentle sway
      if (arr[yi] > HALL_HEIGHT - 0.2) arr[yi] = 0.2            // wrap to floor
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#fff3da"
      />
    </points>
  )
}
