import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import Director from './Director.jsx'
import Lights from './Lights.jsx'
import Env from './Env.jsx'
import Floor from './Floor.jsx'
import Road from './Road.jsx'
import Rain from './Rain.jsx'
import Car from './Car.jsx'
import HeroWord from './HeroWord.jsx'
import Effects from './Effects.jsx'
import CaptureRig from './CaptureRig.jsx'
import { CAPTURE } from '../lib/capture.js'

const isCoarse =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(pointer: coarse)').matches

export default function Experience() {
  const [quality, setQuality] = useState(isCoarse ? 'low' : 'high')
  const [dpr, setDpr] = useState(isCoarse ? 1.25 : 2)

  return (
    <div className="canvas-fixed">
    <Canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      dpr={CAPTURE ? 1 : dpr}
      frameloop={CAPTURE ? 'never' : 'always'}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: CAPTURE,
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      camera={{ fov: 38, near: 0.1, far: 100, position: [4.6, 1.15, 5.0] }}
    >
      <color attach="background" args={['#050506']} />
      <fog attach="fog" args={['#050506', 7, 22]} />

      {!CAPTURE && (
        <PerformanceMonitor
          onDecline={() => {
            setQuality('low')
            setDpr(1.25)
          }}
        />
      )}

      {CAPTURE && <CaptureRig />}
      <Director />
      <Lights />

      <Suspense fallback={null}>
        <Env />
        <Car />
        <HeroWord />
        <Floor quality={quality} />
        <Road />
      </Suspense>

      <Rain />

      <Effects quality={quality} />
    </Canvas>
    </div>
  )
}
