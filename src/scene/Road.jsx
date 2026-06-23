import { useMemo } from 'react'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

// Lane markings painted on the wet road (they catch the key light and reflect in
// the wet floor below). Dark by default — they only read once the scene lifts
// out of the opening darkness.
export default function Road() {
  const dash = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 16
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, 128, 16)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 76, 16) // dash 76px, gap 52px
    const t = new CanvasTexture(c)
    t.wrapS = RepeatWrapping
    t.wrapT = RepeatWrapping
    t.colorSpace = SRGBColorSpace
    t.repeat.set(64, 1)
    t.anisotropy = 4
    return t
  }, [])

  const LEN = 240
  const EDGE = 3.7

  return (
    <group>
      {/* centre dashed line (runs along the driving axis, X) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]}>
        <planeGeometry args={[LEN, 0.18]} />
        <meshStandardMaterial
          map={dash}
          alphaMap={dash}
          transparent
          color="#e7ecf4"
          roughness={0.45}
          metalness={0}
          emissive="#11151c"
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>

      {/* solid lane edges */}
      {[-EDGE, EDGE].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, z]}>
          <planeGeometry args={[LEN, 0.11]} />
          <meshStandardMaterial
            color="#cdd5e2"
            roughness={0.5}
            metalness={0}
            emissive="#0c0f15"
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ))}
    </group>
  )
}
