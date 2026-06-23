import { useCallback, useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'
import { useSceneRefs } from '../scene/SceneRefs.jsx'
import { lenisStart } from '../lib/lenis.js'
import { igniteLights } from '../lib/ignition.js'

const MIN_MS = 2000
const MAX_MS = 6500

export default function Preloader() {
  const { progress, active } = useProgress()
  const refs = useSceneRefs()
  const [done, setDone] = useState(false)
  const rootRef = useRef(null)
  const pctRef = useRef(null)
  const barRef = useRef(null)
  const mountAt = useRef(0)
  const startedOutro = useRef(false)

  const runOutro = useCallback(() => {
    if (startedOutro.current) return
    startedOutro.current = true

    // Reduced-motion: skip the iris/logo animation + ignition strobe.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      igniteLights(refs)
      lenisStart()
      setDone(true)
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        lenisStart()
        setDone(true)
      },
    })
    tl.to('.preloader__logo', { scale: 1.08, duration: 0.5, ease: 'power2.inOut' })
    tl.to('.preloader__foot', { opacity: 0, duration: 0.3 }, '<')
    tl.to(rootRef.current, { clipPath: 'circle(0% at 50% 42%)', duration: 0.75, ease: 'expo.inOut' }, '>-0.05')
    tl.add(() => igniteLights(refs), '<0.18')
  }, [refs])

  useEffect(() => {
    mountAt.current = performance.now()
    const root = rootRef.current
    const draws = root.querySelectorAll('.draw')
    gsap.set(draws, { strokeDashoffset: 1 })
    gsap.to(draws, { strokeDashoffset: 0, duration: 1.15, ease: 'power2.out', stagger: 0.12 })
    gsap.fromTo(
      root.querySelectorAll('.quad'),
      { opacity: 0, scale: 0.6, transformOrigin: '60px 60px' },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, delay: 0.75, ease: 'power3.out' }
    )
    // Hard fail-safe — armed once so it can't be re-created on every progress tick.
    const hard = setTimeout(runOutro, MAX_MS)
    return () => clearTimeout(hard)
  }, [runOutro])

  useEffect(() => {
    if (pctRef.current) pctRef.current.textContent = String(Math.floor(progress)).padStart(3, '0')
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress / 100})`
  }, [progress])

  useEffect(() => {
    if (active || progress < 100) return
    const elapsed = performance.now() - mountAt.current
    const t = setTimeout(runOutro, Math.max(450, MIN_MS - elapsed))
    return () => clearTimeout(t)
  }, [active, progress, runOutro])

  if (done) return null

  return (
    <div className="preloader" ref={rootRef} style={{ clipPath: 'circle(150% at 50% 42%)' }}>
      <svg className="preloader__logo" viewBox="0 0 120 120" aria-hidden>
        <g>
          <circle className="draw" cx="60" cy="60" r="52" pathLength="1" />
          <circle className="draw" cx="60" cy="60" r="38" pathLength="1" />
          <circle className="draw" cx="60" cy="60" r="24" pathLength="1" opacity="0.55" />
          <line className="draw" x1="60" y1="8" x2="60" y2="112" pathLength="1" opacity="0.7" />
          <line className="draw" x1="8" y1="60" x2="112" y2="60" pathLength="1" opacity="0.7" />
          <path className="quad" d="M60 60 L60 22 A38 38 0 0 0 22 60 Z" fill="var(--m-blue)" />
          <path className="quad" d="M60 60 L60 22 A38 38 0 0 1 98 60 Z" fill="#f4f4f5" />
          <path className="quad" d="M60 60 L98 60 A38 38 0 0 1 60 98 Z" fill="var(--m-blue)" />
          <path className="quad" d="M60 60 L22 60 A38 38 0 0 0 60 98 Z" fill="#f4f4f5" />
        </g>
      </svg>

      <div className="preloader__foot">
        <div className="preloader__bar">
          <i ref={barRef} />
        </div>
        <div className="preloader__pct">
          <span ref={pctRef}>000</span> · LOADING THE 330i
        </div>
      </div>
    </div>
  )
}
