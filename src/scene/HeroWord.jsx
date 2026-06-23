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
    const o = MathUtils.clamp(1 - scrollState.progress / 0.1, 0, 1)
    if (!ref.current) return
    ref.current.visible = o > 0.001
    ref.current.fillOpacity = o * 0.55
    ref.current.outlineOpacity = o * 0.5
  })

  return (
    <Billboard position={[-2.3, 1.85, -2.7]}>
      <Text
        ref={ref}
        fontSize={3.1}
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
