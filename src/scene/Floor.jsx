import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, ContactShadows, useTexture } from '@react-three/drei'
import { RepeatWrapping, SRGBColorSpace } from 'three'

// Real wet-asphalt road: PBR asphalt textures + a mirror reflection whose UVs are
// perturbed by an animated water-normal (distortionMap) — so reflections ripple
// like real water on the surface, rather than fake glowing rings.
export default function Floor({ quality = 'high' }) {
  const res = quality === 'high' ? 1024 : 512
  const [diff, nor, rough, distort] = useTexture([
    '/textures/asphalt_diff.jpg',
    '/textures/asphalt_nor.jpg',
    '/textures/asphalt_rough.jpg',
    '/textures/water_normal.jpg',
  ])

  for (const t of [diff, nor, rough, distort]) {
    t.wrapS = t.wrapT = RepeatWrapping
  }
  diff.colorSpace = SRGBColorSpace
  diff.repeat.set(42, 42)
  nor.repeat.set(42, 42)
  rough.repeat.set(42, 42)
  distort.repeat.set(7, 7)

  useFrame((state, dt) => {
    // drift the ripple field so the wet reflections shimmer + move
    const d = Math.min(dt, 0.05)
    distort.offset.x += d * 0.025
    distort.offset.y += d * 0.05
  })

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <MeshReflectorMaterial
          resolution={res}
          mixBlur={0.85}
          mixStrength={3.2}
          blur={quality === 'high' ? [160, 45] : [100, 45]}
          map={diff}
          normalMap={nor}
          normalScale={[0.35, 0.35]}
          roughnessMap={rough}
          roughness={0.32}
          metalness={0.7}
          color="#23262b"
          distortionMap={distort}
          distortion={0.55}
          depthScale={1.1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.25}
          mirror={0}
        />
      </mesh>

      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.8}
        scale={16}
        blur={2.6}
        far={6}
        resolution={quality === 'high' ? 512 : 256}
        color="#000000"
      />
    </>
  )
}
