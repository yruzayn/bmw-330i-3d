import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import { MathUtils } from 'three'
import { getProgress } from '../lib/scroll.js'

// A giant "330i" set BEHIND the car (toward the rear), revealed as the
// headlights come on — coloured like the red taillights it sits in front of,
// with a real red point light spilling onto the car's rear and the wet ground.
export default function HeroWord() {
  const ref = useRef()
  const redLight = useRef()

  useFrame(() => {
    const p = getProgress()
    // appear with the headlights, fade as the car starts to rotate away
    const fadeIn = MathUtils.clamp((p - 0.035) / 0.04, 0, 1)
    const fadeOut = MathUtils.clamp(1 - (p - 0.15) / 0.07, 0, 1)
    const o = Math.min(fadeIn, fadeOut)
    if (ref.current) {
      ref.current.visible = o > 0.001
      ref.current.fillOpacity = o
      ref.current.outlineOpacity = o * 0.6
    }
    if (redLight.current) redLight.current.intensity = o * 22
  })

  return (
    <group>
      {/* red taillight wash onto the car's rear + wet ground */}
      <pointLight
        ref={redLight}
        position={[-2.3, 0.95, 0]}
        color="#ff2030"
        intensity={0}
        distance={9}
        decay={2}
      />
      <Billboard position={[-5.2, 2.2, 0]}>
        <Text
          ref={ref}
          fontSize={4.4}
          anchorX="center"
          anchorY="middle"
          letterSpacing={-0.03}
          color="#c0242e"
          fillOpacity={0}
          outlineWidth={0.012}
          outlineColor="#ff5560"
          outlineOpacity={0}
          material-toneMapped={false}
        >
          330i
        </Text>
      </Billboard>
    </group>
  )
}
