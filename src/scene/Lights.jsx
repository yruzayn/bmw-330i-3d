import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Noir key rig — darkness is the default; one warm rake + a cool rim separate
// the car from the void, plus a soft frontal fill.
export default function Lights() {
  const key = useRef()
  return (
    <>
      <ambientLight intensity={0.04} color="#0a0e1a" />

      {/* warm tungsten key, high camera-left */}
      <spotLight
        ref={key}
        position={[6, 5.5, 3]}
        angle={0.52}
        penumbra={1}
        intensity={110}
        distance={40}
        decay={2}
        color="#fff4e6"
        target-position={[0, 0.6, 0]}
      />

      {/* cool rim from behind to carve the silhouette */}
      <directionalLight position={[-7, 3.5, -4]} intensity={2.0} color="#9fb8ff" />

      {/* gentle frontal fill (kept low so the car emerges from darkness) */}
      <spotLight
        position={[-2, 1.4, 6]}
        angle={0.8}
        penumbra={1}
        intensity={7}
        distance={30}
        decay={2}
        color="#cdd6ff"
      />
    </>
  )
}
