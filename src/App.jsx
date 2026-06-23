import { useEffect, useState } from 'react'
import { SceneRefsProvider } from './scene/SceneRefs.jsx'
import Experience from './scene/Experience.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import Preloader from './components/Preloader.jsx'
import Nav from './components/Nav.jsx'
import Rail from './components/Rail.jsx'
import Counter from './components/Counter.jsx'
import HUD from './components/HUD.jsx'
import PaintSwitcher from './components/PaintSwitcher.jsx'
import Cursor from './components/Cursor.jsx'
import Overlay from './components/Overlay.jsx'

export default function App() {
  // Reveal the chrome (paint switcher) shortly after first paint.
  const [chromeIn, setChromeIn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setChromeIn(true), 2600)
    return () => clearTimeout(t)
  }, [])

  return (
    <SceneRefsProvider>
      <SmoothScroll />
      <Cursor />

      <Experience />

      <div className="fx-vignette" />
      <div className="ignite-flash" id="ignite-flash" />

      <Nav />
      <Rail />
      <Counter />
      <HUD />
      <PaintSwitcher visible={chromeIn} />

      <Overlay />

      <Preloader />
    </SceneRefsProvider>
  )
}
