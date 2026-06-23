import { Environment, Lightformer } from '@react-three/drei'

// Self-contained studio environment (no external HDRI). A bank of Lightformers
// sculpts the clearcoat reflections — long softbox strips along the flanks plus
// rim accents — the signature "wet luxury paint" look. Intensity is modulated
// per-section via scene.environmentIntensity in the Director.
export default function Env() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      {/* base fill */}
      <color attach="background" args={['#0a0c10']} />

      {/* main top softbox */}
      <Lightformer
        intensity={2.2}
        rotation-x={Math.PI / 2}
        position={[0, 6, 0]}
        scale={[12, 12, 1]}
        color="#ffffff"
      />

      {/* long horizontal strips raking the flanks (read as reflections in paint) */}
      <Lightformer
        form="rect"
        intensity={4}
        position={[6, 2, 1]}
        rotation-y={-Math.PI / 2}
        scale={[8, 1.2, 1]}
        color="#dfe7ff"
      />
      <Lightformer
        form="rect"
        intensity={4}
        position={[-6, 2, -1]}
        rotation-y={Math.PI / 2}
        scale={[8, 1.2, 1]}
        color="#fff1e0"
      />
      <Lightformer
        form="rect"
        intensity={3}
        position={[0, 3, -7]}
        rotation-x={-Math.PI / 6}
        scale={[10, 2, 1]}
        color="#cdd8ff"
      />

      {/* warm low kicker */}
      <Lightformer
        form="ring"
        intensity={2}
        position={[3, 0.6, 6]}
        scale={[2, 2, 1]}
        color="#ffd9b0"
      />
    </Environment>
  )
}
