import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { EYE_HEIGHT, MIN_X, MAX_X, MIN_Z, MAX_Z, FRONT_Z } from './constants'

const SPEED = 8
const UP    = new THREE.Vector3(0, 1, 0)
const INTRO_DURATION = 2.6           // seconds of the entry "push-in" glide
const easeInOut = (t) => t * t * (3 - 2 * t)

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export default function Player({ enabled = true }) {
  const { camera, mouse } = useThree()
  const keys  = useRef({})
  const fwd   = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const bob   = useRef(0)     // head-bob phase
  const bobY  = useRef(0)     // smoothed vertical bob offset
  const intro = useRef({ active: false, t: 0, from: 0, to: 0 })

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

  // Kick off a one-time cinematic glide down the hall the moment we enter.
  useEffect(() => {
    if (!enabled) return
    intro.current = { active: true, t: 0, from: camera.position.z, to: FRONT_Z - 8 }
  }, [enabled, camera])

  useFrame((_, delta) => {
    // Keep R3F's raycaster aimed at screen-centre while the pointer is locked
    // so mesh onClick events fire from the crosshair, not a stale cursor.
    if (document.pointerLockElement) mouse.set(0, 0)

    if (!enabled) return

    // ── Intro glide: ease the camera forward, ignore input until it finishes ──
    if (intro.current.active) {
      intro.current.t += delta
      const p = Math.min(1, intro.current.t / INTRO_DURATION)
      camera.position.x = 0
      camera.position.z = THREE.MathUtils.lerp(intro.current.from, intro.current.to, easeInOut(p))
      camera.position.y = EYE_HEIGHT
      if (p >= 1) intro.current.active = false
      return
    }

    const k = keys.current
    const moving = k.KeyW || k.KeyS || k.KeyA || k.KeyD
    if (moving) {
      // Project look direction onto XZ plane so vertical aim never changes height
      camera.getWorldDirection(fwd.current)
      fwd.current.y = 0
      fwd.current.normalize()
      right.current.crossVectors(fwd.current, UP)

      const dist = SPEED * delta
      if (k.KeyW) camera.position.addScaledVector(fwd.current,    dist)
      if (k.KeyS) camera.position.addScaledVector(fwd.current,   -dist)
      if (k.KeyA) camera.position.addScaledVector(right.current, -dist)
      if (k.KeyD) camera.position.addScaledVector(right.current,   dist)
    }

    // Subtle walking head-bob — advances only while moving, eases back to rest.
    if (moving) bob.current += delta * 9
    const target = moving ? Math.sin(bob.current) * 0.035 : 0
    bobY.current = THREE.MathUtils.damp(bobY.current, target, 8, delta)

    // Hard constraints every frame: eye level locked, and stay inside the hall
    // so the user can never clip through a wall or walk out into the void.
    camera.position.x = clamp(camera.position.x, MIN_X, MAX_X)
    camera.position.z = clamp(camera.position.z, MIN_Z, MAX_Z)
    camera.position.y = EYE_HEIGHT + bobY.current
  })

  return <PointerLockControls />
}
