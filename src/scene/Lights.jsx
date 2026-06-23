import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSceneRefs } from './SceneRefs.jsx'

// Noir key rig. The whole rig fades up out of the opening darkness (refs.lights
// 0→1) so the intro reads as "complete dark, only the headlights" before the
// scene is lit.
const KEY = 110
const RIM = 2.0
const FILL = 7
const AMB = 0.04

export default function Lights() {
  const refs = useSceneRefs()
  const key = useRef()
  const rim = useRef()
  const fill = useRef()
  const amb = useRef()

  useFrame(() => {
    const l = refs.lights ?? 1
    if (key.current) key.current.intensity = KEY * l
    if (rim.current) rim.current.intensity = RIM * l
    if (fill.current) fill.current.intensity = FILL * l
    if (amb.current) amb.current.intensity = AMB * l
  })

  return (
    <>
      <ambientLight ref={amb} intensity={AMB} color="#0a0e1a" />

      {/* warm tungsten key, high camera-left */}
      <spotLight
        ref={key}
        position={[6, 5.5, 3]}
        angle={0.52}
        penumbra={1}
        intensity={KEY}
        distance={40}
        decay={2}
        color="#fff4e6"
        target-position={[0, 0.6, 0]}
      />

      {/* cool rim from behind to carve the silhouette */}
      <directionalLight ref={rim} position={[-7, 3.5, -4]} intensity={RIM} color="#9fb8ff" />

      {/* gentle frontal fill (kept low so the car emerges from darkness) */}
      <spotLight
        ref={fill}
        position={[-2, 1.4, 6]}
        angle={0.8}
        penumbra={1}
        intensity={FILL}
        distance={30}
        decay={2}
        color="#cdd6ff"
      />
    </>
  )
}
