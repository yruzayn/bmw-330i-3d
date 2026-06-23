import { useEffect, useState } from 'react'
import { setEnabled, playIgnition, resetIgnition } from '../lib/audio.js'
import { onProgress } from '../lib/scroll.js'

export default function SoundToggle() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    // fire the ignition swell once the headlights come on (if sound is enabled);
    // re-arm when scrolled back to the dark top.
    return onProgress((p) => {
      if (p > 0.05) playIgnition()
      else if (p < 0.02) resetIgnition()
    })
  }, [])

  const toggle = () => {
    const next = !on
    setOn(next)
    setEnabled(next)
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
