import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import { MathUtils } from 'three'
import { scrollState } from '../lib/scroll.js'

// A giant wordmark living IN the 3D scene, set behind the car so the car body
// genuinely occludes it (real depth, not a flat overlay). Fades out as you
// leave the hero so it never floats behind later shots.
export default function HeroWord() {
  const ref = useRef()

  useFrame(() => {
    const p = scrollState.progress
    // appear WITH the hero text (after the headlights), then fade as the car
    // starts to rotate away from the head-on intro.
    const fadeIn = MathUtils.clamp((p - 0.08) / 0.05, 0, 1)
    const fadeOut = MathUtils.clamp(1 - (p - 0.16) / 0.08, 0, 1)
    const o = Math.min(fadeIn, fadeOut)
    if (!ref.current) return
    ref.current.visible = o > 0.001
    ref.current.fillOpacity = o * 0.5
    ref.current.outlineOpacity = o * 0.45
  })

  return (
    <Billboard position={[0, 2.0, -3.4]}>
      <Text
        ref={ref}
        fontSize={2.7}
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.03}
        color="#566072"
        fillOpacity={0.55}
        outlineWidth={0.012}
        outlineColor="#aab4c8"
        outlineOpacity={0.5}
        material-toneMapped={false}
      >
        330i
      </Text>
    </Billboard>
  )
}
