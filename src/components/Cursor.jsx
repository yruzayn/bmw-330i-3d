import { useEffect } from 'react'

export default function Cursor() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('capture')) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot = document.createElement('div')
    const ring = document.createElement('div')
    dot.className = 'cursor'
    ring.className = 'cursor-ring'
    document.body.append(dot, ring)
    document.body.classList.add('custom-cursor')

    const mouse = { x: innerWidth / 2, y: innerHeight / 2 }
    const ringPos = { x: mouse.x, y: mouse.y }
    let raf

    const move = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`
    }

    const loop = () => {
      ringPos.x += (mouse.x - ringPos.x) * 0.18
      ringPos.y += (mouse.y - ringPos.y) * 0.18
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    loop()

    const over = (e) => {
      if (e.target.closest('[data-magnet]')) ring.classList.add('is-hover')
    }
    const out = (e) => {
      if (e.target.closest('[data-magnet]')) ring.classList.remove('is-hover')
    }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
      dot.remove()
      ring.remove()
      document.body.classList.remove('custom-cursor')
    }
  }, [])

  return null
}
