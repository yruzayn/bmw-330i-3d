import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import { Vector2 } from 'three'

// High luminanceThreshold so ONLY ignited emissive + accent bloom — never the
// studio white (otherwise the flip blooms to mush).
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Effects({ quality = 'high' }) {
  const wantCA = quality === 'high' && !prefersReduced
  return (
    <EffectComposer disableNormalPass multisampling={quality === 'high' ? 4 : 0}>
      <Bloom
        mipmapBlur
        intensity={1.2}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.2}
        radius={0.82}
        kernelSize={quality === 'high' ? KernelSize.LARGE : KernelSize.MEDIUM}
      />
      {wantCA ? (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new Vector2(0.0006, 0.0009)}
          radialModulation={false}
          modulationOffset={0}
        />
      ) : null}
      <Vignette eskil={false} offset={0.32} darkness={0.92} />
      <Noise opacity={0.04} premultiply blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  )
}
