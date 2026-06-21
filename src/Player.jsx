import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'

const SPEED      = 8
const EYE_HEIGHT = 1.6
const UP         = new THREE.Vector3(0, 1, 0)

export default function Player() {
  const { camera, mouse } = useThree()
  const keys  = useRef({})
  const fwd   = useRef(new THREE.Vector3())
  const right  = useRef(new THREE.Vector3())

  useEffect(() => {
    const onDown = (e) => { keys.current[e.code] = true  }
    const onUp   = (e) => { keys.current[e.code] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup',   onUp)
    }
  }, [])

  useFrame((_, delta) => {
    // Keep R3F's raycaster aimed at screen-centre while the pointer is locked
    // so mesh onClick events fire from the crosshair, not a stale cursor position
    if (document.pointerLockElement) mouse.set(0, 0)

    const k = keys.current
    if (!k.KeyW && !k.KeyS && !k.KeyA && !k.KeyD) return

    // Project look direction onto XZ plane so vertical aim never affects height
    camera.getWorldDirection(fwd.current)
    fwd.current.y = 0
    fwd.current.normalize()
    right.current.crossVectors(fwd.current, UP)

    const dist = SPEED * delta
    if (k.KeyW) camera.position.addScaledVector(fwd.current,    dist)
    if (k.KeyS) camera.position.addScaledVector(fwd.current,   -dist)
    if (k.KeyA) camera.position.addScaledVector(right.current, -dist)
    if (k.KeyD) camera.position.addScaledVector(right.current,   dist)

    // Hard-lock eye level — never allow gravity or drift
    camera.position.y = EYE_HEIGHT
  })

  return <PointerLockControls />
}
