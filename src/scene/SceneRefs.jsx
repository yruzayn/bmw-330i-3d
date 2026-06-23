import { createContext, useContext, useRef } from 'react'
import { Color } from 'three'

// A single mutable object shared across the 3D scene + UI. Populated by <Car>
// once the GLB loads; read every frame by <Director>; mutated by the paint
// switcher and the ignition sequence. Deliberately NOT React state — it must
// not trigger re-renders at 60fps.
function makeRefs() {
  return {
    carRig: { current: null }, // THREE.Group — scroll rotation lives here
    headlights: [], // materials -> emissive white
    taillights: [], // materials -> emissive red
    grille: [], // materials -> emissive accent (front badge/kidney)
    paint: [], // CarPaint materials -> body color
    // ignition multipliers (0..1) animated by the preloader handoff
    ignite: { head: 0, tail: 0 },
    // current paint color target (lerped each frame onto paint materials)
    paintColor: new Color('#0a0e14'),
    paintColorCurrent: new Color('#0a0e14'),
    settle: { v: 0 }, // small extra yaw "settle" when switching paint
    ready: false,
  }
}

const Ctx = createContext(null)

export function SceneRefsProvider({ children }) {
  const ref = useRef(makeRefs())
  return <Ctx.Provider value={ref.current}>{children}</Ctx.Provider>
}

export function useSceneRefs() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSceneRefs must be used within SceneRefsProvider')
  return ctx
}
