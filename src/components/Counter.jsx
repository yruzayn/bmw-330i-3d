import { useEffect, useRef } from 'react'
import { onProgress } from '../lib/scroll.js'
import { SECTIONS } from '../lib/sections.js'

export default function Counter() {
  const barRef = useRef(null)
  const numsRef = useRef([])

  useEffect(() => {
    const last = SECTIONS.length - 1
    return onProgress((p) => {
      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`
      // 7 evenly-spaced DOM panels occupy 1/7 scroll bands each.
      const active = Math.min(last, Math.floor(p * SECTIONS.length))
      numsRef.current.forEach((el, i) => {
        if (el) el.classList.toggle('is-active', i === active)
      })
    })
  }, [])

  return (
    <div className="counter">
      <div className="counter__nums">
        {SECTIONS.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => (numsRef.current[i] = el)}
            className="counter__num"
          >
            <b>{s.index}</b>
          </div>
        ))}
      </div>
      <div className="counter__track">
        <div ref={barRef} className="counter__bar" />
      </div>
    </div>
  )
}
