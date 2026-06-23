import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setProgress } from '../lib/scroll.js'
import { lenisHolder } from '../lib/lenis.js'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll() {
  useEffect(() => {
    // Always begin at the hero so the preloader → ignition sequence plays.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = new Lenis({
      lerp: reduced ? 1 : 0.085,
      wheelMultiplier: 1.05,
      smoothWheel: !reduced,
      smoothTouch: false,
    })
    lenisHolder.instance = lenis
    lenis.stop() // released by the preloader handoff
    if (lenisHolder.wantStart) lenis.start() // handoff already happened

    const onScroll = (e) => {
      setProgress(e.progress ?? 0, e.velocity ?? 0)
      ScrollTrigger.update()
    }
    lenis.on('scroll', onScroll)

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Re-measure once layout settles.
    const ro = requestAnimationFrame(() => {
      lenis.resize()
      ScrollTrigger.refresh()
    })

    // Keep Lenis's virtualized dimensions + ScrollTrigger in sync on resize,
    // otherwise scroll progress (which drives the whole 3D choreography) and the
    // reveal triggers desync from layout.
    let rid
    const onResize = () => {
      cancelAnimationFrame(rid)
      rid = requestAnimationFrame(() => {
        lenis.resize()
        ScrollTrigger.refresh()
      })
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(ro)
      cancelAnimationFrame(rid)
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(tick)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      lenisHolder.instance = null
    }
  }, [])

  return null
}
