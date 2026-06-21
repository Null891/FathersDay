import { EffectComposer, Bloom, Vignette, BrightnessContrast, HueSaturation } from '@react-three/postprocessing'

// Post-processing stack — the single biggest "premium" lever.
// • Bloom    : warm lights + the faintly-emissive photos gently glow.
// • Vignette : darkens the frame edges so the eye is drawn down the hall.
// • Contrast : a touch of filmic punch.
// • Saturation: a hair of warmth in the colour grade.
// Kept deliberately subtle — this is grading, not an Instagram filter.
export default function Effects() {
  return (
    <EffectComposer multisampling={4} disableNormalPass>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.32}
        mipmapBlur
        radius={0.7}
      />
      <BrightnessContrast brightness={0.0} contrast={0.09} />
      <HueSaturation saturation={0.07} />
      <Vignette offset={0.32} darkness={0.62} eskil={false} />
    </EffectComposer>
  )
}
