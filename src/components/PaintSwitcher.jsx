import { useState } from 'react'
import { PAINTS } from '../lib/paints.js'
import { useSceneRefs } from '../scene/SceneRefs.jsx'

export default function PaintSwitcher({ visible }) {
  const refs = useSceneRefs()
  const [active, setActive] = useState(0)

  const pick = (i) => {
    setActive(i)
    refs.paintColor.set(PAINTS[i].hex)
    refs.settle.v = -0.07 // small re-catch-the-light yaw nudge (damped back to 0)
  }

  return (
    <div className={`paint ${visible ? 'is-visible' : ''}`} data-magnet-skip>
      <span className="paint__label">Paint</span>
      <div className="paint__swatches">
        {PAINTS.map((p, i) => (
          <button
            key={p.id}
            className={`paint__swatch ${i === active ? 'is-active' : ''}`}
            style={{ background: p.hex }}
            onClick={() => pick(i)}
            aria-label={p.name}
            data-magnet
          />
        ))}
      </div>
      <span className="paint__name">{PAINTS[active].name}</span>
    </div>
  )
}
