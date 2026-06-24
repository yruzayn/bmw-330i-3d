import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setProgress } from '../lib/scroll.js'
import { useSceneRefs } from './SceneRefs.jsx'

// Drives the whole scene deterministically for offline rendering. The render
// harness calls window.__cap.frame(progress, dtMs) once per output frame; we
// advance a virtual clock and render exactly one R3F frame (frameloop="never").
export default function CaptureRig() {
  const advance = useThree((s) => s.advance)
  const refs = useSceneRefs()

  useEffect(() => {
    let vt = 0
    // stop GSAP from advancing on its own; we drive it via gsap.updateRoot().
    try {
      gsap.ticker.lagSmoothing(0)
      gsap.ticker.sleep()
    } catch (e) {
      /* noop */
    }
    // the preloader (which normally enables the lights on handoff) is skipped in
    // capture mode, so enable the light multipliers here.
    refs.ignite.head = 1
    refs.ignite.tail = 1
    const maxY = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    window.__cap = {
      ready: () => !!refs.ready,
      frame: (p, dtMs) => {
        vt += dtMs
        window.__forceP = p
        window.scrollTo(0, p * maxY()) // native scroll → ScrollTrigger reveals
        setProgress(p) // scrollState + onProgress (counter, HUD, hero gate)
        ScrollTrigger.update()
        gsap.updateRoot(vt / 1000) // advance all GSAP tweens deterministically
        advance(vt) // render one frame; R3F dt derives from vt
      },
    }
    return () => {
      delete window.__cap
    }
  }, [advance, refs])

  return null
}
