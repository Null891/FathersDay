import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { roomState } from './roomState'

// ── Constants ────────────────────────────────────────────────────────────────
const DUST_COUNT     = 400
const CON_THRESH     = 3.6   // world units — max distance for constellation line
const CON_THRESH_SQ  = CON_THRESH * CON_THRESH
const MAX_LINES      = 80
const SEASONAL_COUNT = 200

// ── DustMotes + Constellations ───────────────────────────────────────────────
// One InstancedMesh of fine dust spheres drifting on slow noise paths.
// Constellation lines connect nearby pairs: O(n²) check every 3rd frame,
// computed on a pre-allocated Float32Array to avoid GC, capped at MAX_LINES.
function DustMotes() {
  const meshRef = useRef()
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  const frameRef = useRef(0)

  // Per-particle seeds (polar-ish placement inside the room)
  const seeds = useMemo(() => Array.from({ length: DUST_COUNT }, () => {
    const a = Math.random() * Math.PI * 2
    const r = 2.5 + Math.random() * 11
    return {
      ox: Math.cos(a) * r, oz: Math.sin(a) * r,
      oy: 0.5 + Math.random() * 10,
      vy: 0.055 + Math.random() * 0.12,  // gentle upward drift
      ax: 0.25 + Math.random() * 0.55,   // sway amplitude x
      az: 0.25 + Math.random() * 0.55,
      sx: 0.12 + Math.random() * 0.22,   // sway speed
      sz: 0.12 + Math.random() * 0.22,
      px: Math.random() * Math.PI * 2,   // phase offset
      pz: Math.random() * Math.PI * 2,
      s:  0.016 + Math.random() * 0.026, // scale
    }
  }), [])

  // Typed array — particle world positions written each frame, read for constellations
  const posArr = useMemo(() => new Float32Array(DUST_COUNT * 3), [])

  // Pre-allocated LineSegments geometry — never reallocated, setDrawRange trims it
  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_LINES * 6), 3))
    g.setDrawRange(0, 0)
    return g
  }, [])

  // Materials created imperatively so golden-hour color can be updated in useFrame
  const dustMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ccc0f0', transparent: true, opacity: 0.26, toneMapped: false, depthWrite: false,
  }), [])
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({
    color: '#b0a0e4', transparent: true, opacity: 0.13, toneMapped: false, depthWrite: false,
  }), [])

  const coldDust  = useMemo(() => new THREE.Color('#ccc0f0'), [])
  const warmDust  = useMemo(() => new THREE.Color('#f0d880'), [])
  const coldLine  = useMemo(() => new THREE.Color('#b0a0e4'), [])
  const warmLine  = useMemo(() => new THREE.Color('#e0b840'), [])

  // Clean up imperative objects on unmount
  useEffect(() => () => { lineGeom.dispose(); dustMat.dispose(); lineMat.dispose() }, [lineGeom, dustMat, lineMat])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime

    // Update positions
    for (let i = 0; i < DUST_COUNT; i++) {
      const s = seeds[i]
      const x = s.ox + Math.sin(t * s.sx + s.px) * s.ax
      const y = ((s.oy + t * s.vy) % 12) + 0.3
      const z = s.oz + Math.cos(t * s.sz + s.pz) * s.az
      posArr[i * 3]     = x
      posArr[i * 3 + 1] = y
      posArr[i * 3 + 2] = z
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(s.s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true

    // Golden-hour color shift
    const gh = roomState.goldenHourT
    dustMat.color.lerpColors(coldDust, warmDust, gh)
    lineMat.color.lerpColors(coldLine, warmLine, gh)

    // Constellation check every 3rd frame — O(n²) on typed array, exits at cap
    frameRef.current++
    if (frameRef.current % 3 === 0) {
      const pa = lineGeom.attributes.position.array
      let lc = 0
      outer: for (let i = 0; i < DUST_COUNT; i++) {
        const ix = posArr[i * 3], iy = posArr[i * 3 + 1], iz = posArr[i * 3 + 2]
        for (let j = i + 1; j < DUST_COUNT; j++) {
          const dx = ix - posArr[j * 3]
          const dy = iy - posArr[j * 3 + 1]
          const dz = iz - posArr[j * 3 + 2]
          if (dx * dx + dy * dy + dz * dz < CON_THRESH_SQ) {
            const b = lc * 6
            pa[b]   = ix;            pa[b + 1] = iy;            pa[b + 2] = iz
            pa[b + 3] = posArr[j * 3]; pa[b + 4] = posArr[j * 3 + 1]; pa[b + 5] = posArr[j * 3 + 2]
            lc++
            if (lc >= MAX_LINES) break outer
          }
        }
      }
      // Zero out unused slots so stale lines don't persist
      for (let k = lc; k < MAX_LINES; k++) {
        pa[k * 6] = pa[k * 6 + 1] = pa[k * 6 + 2] = pa[k * 6 + 3] = pa[k * 6 + 4] = pa[k * 6 + 5] = 0
      }
      lineGeom.attributes.position.needsUpdate = true
      lineGeom.setDrawRange(0, lc * 2)
    }
  })

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, DUST_COUNT]} material={dustMat}>
        <sphereGeometry args={[1, 4, 4]} />
      </instancedMesh>
      <lineSegments geometry={lineGeom} material={lineMat} />
    </>
  )
}

// ── SeasonalParticles ────────────────────────────────────────────────────────
// Three InstancedMesh systems (spring / autumn / winter). Opacity is lerped
// toward 1 for the active season and toward 0 for the rest — no React re-renders.
// Particle positions are only recomputed when the mesh has nonzero opacity.
function SeasonalParticles() {
  const springRef = useRef()
  const autumnRef = useRef()
  const winterRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const seeds = useMemo(() => Array.from({ length: SEASONAL_COUNT }, (_, i) => {
    const a = Math.random() * Math.PI * 2
    return {
      a,
      r:   2.5 + Math.random() * 11,
      y0:  Math.random() * 14,
      vy:  0.25 + Math.random() * 0.65,
      sw:  0.35 + Math.random() * 0.7,   // sway amplitude
      sp:  0.18 + Math.random() * 0.38,  // sway speed
      ph:  Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      rsp: (Math.random() - 0.5) * 0.5,
      sc:  0.09 + (i % 3) * 0.04,        // scale
    }
  }), [])

  // Per-season materials — opacity animated in useFrame
  const springMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffb0cc', transparent: true, opacity: 0,
    side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
  }), [])
  const autumnMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#c86a10', transparent: true, opacity: 0,
    side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
  }), [])
  const winterMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ddeeff', transparent: true, opacity: 0,
    depthWrite: false, toneMapped: false,
  }), [])

  const springOp = useRef(0), autumnOp = useRef(0), winterOp = useRef(0)

  // Initialise all instances off-screen on mount
  useEffect(() => {
    [springRef, autumnRef, winterRef].forEach((ref) => {
      if (!ref.current) return
      for (let i = 0; i < SEASONAL_COUNT; i++) {
        dummy.position.set(0, -200, 0)
        dummy.scale.setScalar(0.01)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }
      ref.current.instanceMatrix.needsUpdate = true
    })
  }, [dummy])

  useEffect(() => () => {
    springMat.dispose(); autumnMat.dispose(); winterMat.dispose()
  }, [springMat, autumnMat, winterMat])

  useFrame(({ clock }, dt) => {
    const t   = clock.elapsedTime
    const s   = roomState.season
    const RATE = 1.6  // fade rate (lambda for MathUtils.damp)

    // Lerp each season's opacity toward its target
    springOp.current = THREE.MathUtils.damp(springOp.current, s === 'spring' ? 1 : 0, RATE, dt)
    autumnOp.current = THREE.MathUtils.damp(autumnOp.current, s === 'autumn' ? 1 : 0, RATE, dt)
    winterOp.current = THREE.MathUtils.damp(winterOp.current, s === 'winter' ? 1 : 0, RATE, dt)

    springMat.opacity = springOp.current * 0.72
    autumnMat.opacity = autumnOp.current * 0.68
    winterMat.opacity = winterOp.current * 0.60

    // Update positions only for visible seasons
    const pairs = [
      [springRef, springOp],
      [autumnRef, autumnOp],
      [winterRef, winterOp],
    ]
    pairs.forEach(([ref, op]) => {
      if (!ref.current || op.current < 0.01) return
      for (let i = 0; i < SEASONAL_COUNT; i++) {
        const sd = seeds[i]
        const x = Math.cos(sd.a) * sd.r + Math.sin(t * sd.sp + sd.ph) * sd.sw
        const y = ((sd.y0 + t * sd.vy) % 15)
        const z = Math.sin(sd.a) * sd.r + Math.cos(t * sd.sp * 0.75 + sd.ph) * sd.sw * 0.6
        dummy.position.set(x, y, z)
        dummy.rotation.set(sd.rot + t * sd.rsp, t * sd.rsp * 0.6, sd.rot * 0.8)
        dummy.scale.setScalar(sd.sc)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }
      ref.current.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <>
      {/* Spring — hexagonal cherry blossoms (circleGeometry 6 sides) */}
      <instancedMesh ref={springRef} args={[undefined, undefined, SEASONAL_COUNT]} material={springMat}>
        <circleGeometry args={[1, 6]} />
      </instancedMesh>
      {/* Autumn — elongated leaf quads */}
      <instancedMesh ref={autumnRef} args={[undefined, undefined, SEASONAL_COUNT]} material={autumnMat}>
        <planeGeometry args={[0.9, 1.4]} />
      </instancedMesh>
      {/* Winter — tiny snow spheres */}
      <instancedMesh ref={winterRef} args={[undefined, undefined, SEASONAL_COUNT]} material={winterMat}>
        <sphereGeometry args={[1, 5, 5]} />
      </instancedMesh>
    </>
  )
}

// ── SeasonToggle ─────────────────────────────────────────────────────────────
// A small frosted-glass card positioned in the room (3D space via Html transform),
// not a flat screen overlay. Writes to roomState.season on click.
const SEASONS = [
  { key: 'dust',   label: 'Still Air', icon: '✦',  dot: '#cdb8ff' },
  { key: 'spring', label: 'Spring',    icon: '🌸', dot: '#ffb0cc' },
  { key: 'autumn', label: 'Autumn',    icon: '🍂', dot: '#e08a30' },
  { key: 'winter', label: 'Winter',    icon: '❄️', dot: '#dbeeff' },
]

function SeasonToggle() {
  const [active, setActive] = useState('dust')

  const choose = useCallback((key) => {
    setActive(key)
    roomState.season = key
  }, [])

  return (
    <group position={[7.8, 0.95, 0.5]} rotation={[0, -1.05, 0]}>
      <Html transform center distanceFactor={5.5} zIndexRange={[20, 0]}>
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            width: '130px',
            background: 'linear-gradient(140deg, rgba(28,22,46,0.75), rgba(12,9,22,0.80))',
            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(201,162,42,0.28)',
            borderRadius: '14px',
            padding: '13px 14px 10px',
            userSelect: 'none',
          }}
        >
          <p style={{
            margin: '0 0 9px', textAlign: 'center',
            fontSize: '8px', letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'rgba(201,162,42,0.65)', fontFamily: 'system-ui, sans-serif',
          }}>
            Atmosphere
          </p>
          {SEASONS.map(({ key, label, icon, dot }) => {
            const isActive = active === key
            return (
              <button
                key={key}
                onClick={() => choose(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  width: '100%', textAlign: 'left',
                  background: isActive ? 'rgba(201,162,42,0.14)' : 'transparent',
                  border: isActive ? '1px solid rgba(201,162,42,0.42)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '6px 9px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  color: isActive ? '#f3ead2' : 'rgba(255,255,255,0.45)',
                  fontSize: '12px',
                  fontFamily: 'system-ui, sans-serif',
                  transition: 'color 0.2s, background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '13px', lineHeight: 1 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {/* Season-colour swatch — glows when active */}
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%', background: dot,
                  opacity: isActive ? 1 : 0.4,
                  boxShadow: isActive ? `0 0 8px ${dot}` : 'none',
                  transition: 'opacity 0.2s, box-shadow 0.2s',
                }} />
              </button>
            )
          })}
        </div>
      </Html>
    </group>
  )
}

// ── Default export ────────────────────────────────────────────────────────────
export default function RoomParticles() {
  return (
    <>
      <DustMotes />
      <SeasonalParticles />
      <SeasonToggle />
    </>
  )
}
