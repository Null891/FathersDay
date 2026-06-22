import { EffectComposer, Bloom, Vignette, BrightnessContrast, HueSaturation } from '@react-three/postprocessing'

// Post-processing stack — the single biggest "premium" lever.
// • Bloom    : warm lights + the faintly-emissive photos / orbs gently glow.
// • Vignette : darkens the frame edges so the eye is drawn in.
// • Contrast : a touch of filmic punch.
// • Saturation: a hair of warmth in the colour grade.
// Kept deliberately subtle — this is grading, not an Instagram filter.
//
// Scene-aware: the tunnel is near-black so bloom can be generous and the
// vignette heavy. The grand room is far brighter, so we raise the bloom
// threshold and lighten the vignette to keep it from blooming hot / closing in.
export default function Effects({ room = false }) {
  return (
    <EffectComposer multisampling={4} disableNormalPass>
      <Bloom
        intensity={room ? 0.42 : 0.55}
        luminanceThreshold={room ? 0.72 : 0.55}
        luminanceSmoothing={room ? 0.4 : 0.32}
        mipmapBlur
        radius={room ? 0.6 : 0.7}
      />
      <BrightnessContrast brightness={0.0} contrast={0.09} />
      <HueSaturation saturation={0.07} />
      <Vignette offset={room ? 0.4 : 0.32} darkness={room ? 0.42 : 0.62} eskil={false} />
    </EffectComposer>
  )
}
