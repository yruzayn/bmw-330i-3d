import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { sampleChoreo, createChoreoState } from '../lib/choreography.js'
import { getProgress } from '../lib/scroll.js'
import { useSceneRefs } from './SceneRefs.jsx'

const HEAD_MAX = 7.0
const GRILLE_MAX = 4.0
const TAIL_MAX = 4.0

export default function Director() {
  const { camera, scene, gl } = useThree()
  const refs = useSceneRefs()
  const choreo = useRef(createChoreoState()).current
  const camPos = useRef(new Vector3(4.6, 1.15, 5.0)).current
  const camTarget = useRef(new Vector3(0.4, 0.7, 0)).current
  if (import.meta.env.DEV && typeof window !== 'undefined') window.__three = { scene, camera }

  const studioActive = useRef(false)
  const studioCss = useRef('')
  const started = useRef(false)
  const reduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const p = getProgress()
    sampleChoreo(p, choreo)

    // Snap on first frame and under reduced-motion, then damp for silk.
    const lambda = reduced ? 1e6 : started.current ? 5.5 : 1000
    started.current = true
    camPos.x = MathUtils.damp(camPos.x, choreo.pos.x, lambda, d)
    camPos.y = MathUtils.damp(camPos.y, choreo.pos.y, lambda, d)
    camPos.z = MathUtils.damp(camPos.z, choreo.pos.z, lambda, d)
    camTarget.x = MathUtils.damp(camTarget.x, choreo.target.x, lambda, d)
    camTarget.y = MathUtils.damp(camTarget.y, choreo.target.y, lambda, d)
    camTarget.z = MathUtils.damp(camTarget.z, choreo.target.z, lambda, d)

    // Aspect-aware framing: widen FOV + dolly back on narrow viewports so the
    // car stays framed in every shot (portrait would otherwise crop wide angles).
    const aspect = camera.aspect
    const targetFov = aspect < 0.7 ? 56 : aspect < 1 ? 48 : aspect < 1.4 ? 40 : 38
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
    }
    const dolly = aspect < 0.7 ? 1.34 : aspect < 1 ? 1.16 : 1

    // Subtle breathing so a parked frame never feels dead (off for reduced-motion).
    const t = state.clock.elapsedTime
    const bx = reduced ? 0 : Math.sin(t * 0.35) * 0.025
    const by = reduced ? 0 : Math.sin(t * 0.5) * 0.02
    camera.position.set(
      camTarget.x + (camPos.x - camTarget.x) * dolly + bx,
      camTarget.y + (camPos.y - camTarget.y) * dolly + by,
      camTarget.z + (camPos.z - camTarget.z) * dolly
    )
    camera.lookAt(camTarget)

    // World tone.
    if (scene.background) scene.background.copy(choreo.bg)
    if (scene.fog) {
      scene.fog.color.copy(choreo.bg)
      scene.fog.near = choreo.fogNear
      scene.fog.far = choreo.fogFar
    }
    scene.environmentIntensity = choreo.env
    gl.toneMappingExposure = MathUtils.damp(
      gl.toneMappingExposure,
      choreo.exposure,
      reduced ? 1e6 : 6,
      d
    )

    // Doors: open just after the headlights, hold, then close as the car turns.
    if (refs.doors && refs.doors.length) {
      let dOpen = 0
      if (p > 0.14 && p < 0.3) {
        if (p < 0.2) dOpen = (p - 0.14) / 0.06
        else if (p < 0.24) dOpen = 1
        else dOpen = 1 - (p - 0.24) / 0.06
      }
      dOpen = MathUtils.clamp(dOpen, 0, 1)
      const e = dOpen * dOpen * (3 - 2 * dOpen) // smoothstep
      for (const d of refs.doors) {
        d.pivot.rotation.y = MathUtils.damp(d.pivot.rotation.y, e * d.angle, 8, dt)
      }
    }

    // Car rotation.
    if (refs.carRig.current) {
      refs.carRig.current.rotation.y = MathUtils.damp(
        refs.carRig.current.rotation.y,
        choreo.carYaw + refs.settle.v,
        reduced ? 1e6 : 7,
        d
      )
    }

    // Light emissives = choreo level × ignition multiplier.
    if (refs.ready) {
      const head = choreo.headlights * refs.ignite.head
      const tail = choreo.taillights * refs.ignite.tail
      for (const m of refs.headlights) m.emissiveIntensity = head * HEAD_MAX
      for (const m of refs.grille) m.emissiveIntensity = head * GRILLE_MAX
      for (const m of refs.taillights) m.emissiveIntensity = tail * TAIL_MAX

      // Damp the live paint color toward its target.
      refs.paintColorCurrent.lerp(refs.paintColor, 1 - Math.exp(-8 * d))
      for (const m of refs.paint) m.color.copy(refs.paintColorCurrent)
      refs.settle.v = MathUtils.damp(refs.settle.v, 0, 4, d)
    }

    // Publish studio amount + intro light level for other scene elements.
    refs.studio = choreo.studio
    refs.lights = MathUtils.smoothstep(p, 0.045, 0.15) // 0 in the dark intro → 1 after

    // DOM flip in lockstep with the studio value.
    const wantStudio = choreo.studio > 0.5
    if (wantStudio !== studioActive.current) {
      studioActive.current = wantStudio
      document.body.classList.toggle('studio', wantStudio)
    }
    const s = choreo.studio.toFixed(3)
    if (s !== studioCss.current) {
      studioCss.current = s
      document.documentElement.style.setProperty('--studio', s)
    }
  })

  return null
}
