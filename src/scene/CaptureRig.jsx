import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setProgress } from '../lib/scroll.js'
import { useSceneRefs } from './SceneRefs.jsx'

// Drives the whole scene deterministically for offline rendering. The render
// harness calls window.__cap.frame(progress, dtMs) once per output frame.
// R3F's manual advance(timestamp) sets clock.elapsedTime = timestamp and
// delta = timestamp - prev, BOTH interpreted in SECONDS — so we advance the
// virtual clock in seconds, giving an exact, even timestep every frame (no
// real-wall-clock jitter, so the camera breathing etc. stay perfectly smooth).
export default function CaptureRig() {
  const advance = useThree((s) => s.advance)
  const refs = useSceneRefs()

  useEffect(() => {
    let vt = 0 // virtual time, SECONDS
    try {
      gsap.ticker.lagSmoothing(0)
      gsap.ticker.sleep() // GSAP is driven manually via gsap.updateRoot()
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
        vt += dtMs / 1000 // seconds
        window.__forceP = p
        window.scrollTo(0, p * maxY()) // native scroll → ScrollTrigger reveals
        setProgress(p) // scrollState + onProgress (counter, HUD, hero gate)
        ScrollTrigger.update()
        gsap.updateRoot(vt) // advance GSAP deterministically (seconds)
        advance(vt) // render one frame; clock.elapsedTime + delta in seconds
      },
    }
    return () => {
      delete window.__cap
    }
  }, [advance, refs])

  return null
}
