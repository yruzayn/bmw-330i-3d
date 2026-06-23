import { MeshReflectorMaterial, ContactShadows } from '@react-three/drei'

// Wet-look reflective floor that dissolves into the void (no horizon seam),
// plus a tight contact shadow to ground the car.
export default function Floor({ quality = 'high' }) {
  const res = quality === 'high' ? 1024 : 512
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
          resolution={res}
          mixBlur={0.7}
          mixStrength={2.4}
          blur={quality === 'high' ? [180, 50] : [110, 50]}
          depthScale={1.15}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.3}
          roughness={0.42}
          metalness={0.85}
          color="#040406"
          mirror={0}
        />
      </mesh>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.85}
        scale={16}
        blur={2.6}
        far={6}
        resolution={quality === 'high' ? 512 : 256}
        color="#000000"
      />
    </>
  )
}
