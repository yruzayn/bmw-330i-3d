import { useEffect, useRef, useState } from 'react'
import { onProgress } from '../lib/scroll.js'

// Telemetry read-out tied to the performance section. Velocity is a pure
// function of scroll inside the panel (scrubby + deterministic).
// Bracket the performance keyframe (at 0.54) so the speedo peaks ON the shot.
const IN = 0.42
const OUT = 0.6
const RAMP_A = 0.42
const RAMP_B = 0.54

export default function HUD() {
  const [visible, setVisible] = useState(false)
  const numRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    return onProgress((p) => {
      const show = p > IN && p < OUT
      setVisible(show)
      if (!show) return
      const k = Math.max(0, Math.min(1, (p - RAMP_A) / (RAMP_B - RAMP_A)))
      const speed = Math.round(k * 100)
      if (numRef.current) numRef.current.textContent = String(speed).padStart(3, '0')
      if (barRef.current) barRef.current.style.transform = `scaleX(${k})`
    })
  }, [])

  return (
    <div className={`hud ${visible ? 'is-visible' : ''}`} aria-hidden={!visible}>
      <div className="hud__row">
        <span className="hud__num" ref={numRef}>
          000
        </span>
        <span className="hud__unit">km/h</span>
      </div>
      <div className="hud__track">
        <div className="hud__bar" ref={barRef} />
      </div>
      <div className="hud__label">Acceleration · 0–100</div>
    </div>
  )
}
