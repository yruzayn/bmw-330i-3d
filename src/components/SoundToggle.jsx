import { useEffect, useRef, useState } from 'react'
import { setEnabled, playIgnition, resetIgnition } from '../lib/audio.js'
import { onProgress } from '../lib/scroll.js'

export default function SoundToggle() {
  const [on, setOn] = useState(false)
  const userTouched = useRef(false) // did the user explicitly use the toggle?

  // Auto-enable audio on the first real gesture (browsers block earlier).
  useEffect(() => {
    const enableOnce = (e) => {
      if (userTouched.current) return
      // ignore gestures on the toggle itself — it manages its own state
      if (e && e.target && e.target.closest && e.target.closest('.sound')) return
      userTouched.current = true
      setOn(true)
      setEnabled(true)
      window.removeEventListener('wheel', enableOnce)
      window.removeEventListener('pointerdown', enableOnce)
      window.removeEventListener('keydown', enableOnce)
      window.removeEventListener('touchstart', enableOnce)
    }
    window.addEventListener('wheel', enableOnce, { passive: true })
    window.addEventListener('pointerdown', enableOnce)
    window.addEventListener('keydown', enableOnce)
    window.addEventListener('touchstart', enableOnce, { passive: true })
    return () => {
      window.removeEventListener('wheel', enableOnce)
      window.removeEventListener('pointerdown', enableOnce)
      window.removeEventListener('keydown', enableOnce)
      window.removeEventListener('touchstart', enableOnce)
    }
  }, [])

  useEffect(() => {
    // fire the ignition swell once the headlights come on; re-arm at the top.
    return onProgress((p) => {
      if (p > 0.05) playIgnition()
      else if (p < 0.02) resetIgnition()
    })
  }, [])

  const toggle = () => {
    userTouched.current = true
    setOn((prev) => {
      const next = !prev
      setEnabled(next)
      return next
    })
  }

  return (
    <button
      className={`sound ${on ? 'is-on' : ''}`}
      onClick={toggle}
      data-magnet
      aria-pressed={on}
      aria-label={on ? 'Mute sound' : 'Enable sound'}
    >
      <span className="sound__bars" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="sound__label">{on ? 'Sound' : 'Sound off'}</span>
    </button>
  )
}
