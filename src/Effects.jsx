import { useMemo } from 'react'
import { EffectComposer, Bloom, DepthOfField, Vignette, BrightnessContrast, HueSaturation, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

// Post-processing stack — scene-aware: tunnel vs. grand room have different grades.
//
// Grand room:
//   Bloom threshold 0.3 / intensity 1.2 — dark marble means only lit surfaces bloom,
//   producing dramatic museum-style halos on the uplights and emissive elements.
//   Vignette 0.6 — pulls attention inward.
//   ChromaticAberration (radialModulation) — subtle lens fringing on periphery only,
//   reinforces the sense of looking through a physical camera/eye into a real space.
//
// Tunnel: unchanged from original calibration.
export default function Effects({ room = false }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.0009, 0.0009), [])

  return (
    // HalfFloat frame buffer → 16-bit precision kills the concentric colour
    // banding that 8-bit buffers produce across the dark dome gradient.
    <EffectComposer multisampling={4} disableNormalPass frameBufferType={THREE.HalfFloatType}>
      <Bloom
        intensity={room ? 0.95 : 0.55}
        luminanceThreshold={room ? 0.45 : 0.55}
        luminanceSmoothing={room ? 0.28 : 0.32}
        mipmapBlur
        radius={room ? 0.70 : 0.70}
      />
      {room && (
        <DepthOfField
          focusDistance={0.12}
          focalLength={0.018}
          bokehScale={2.2}
          height={480}
        />
      )}
      <BrightnessContrast brightness={0.0} contrast={0.09} />
      <HueSaturation saturation={0.07} />
      <Vignette offset={room ? 0.35 : 0.32} darkness={room ? 0.60 : 0.62} eskil={false} />
      {room && (
        <ChromaticAberration
          offset={caOffset}
          radialModulation
          modulationOffset={0.45}
        />
      )}
    </EffectComposer>
  )
}
