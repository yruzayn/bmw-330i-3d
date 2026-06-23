import gsap from 'gsap'

// Signature #1 — the hero switch-on. Real bulb inrush flicker on the headlight
// emissive multiplier, a paired screen flash, fired as the preloader iris
// passes the lamps so reveal + ignition read as causal.
export function igniteLights(refs) {
  refs.ignite.tail = 1
  gsap.killTweensOf(refs.ignite)

  // Respect reduced-motion: snap the lights on, skip the strobe + screen flash.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    refs.ignite.head = 1
    return
  }

  gsap
    .timeline()
    .to(refs.ignite, { head: 0.95, duration: 0.06, ease: 'none' })
    .to(refs.ignite, { head: 0.2, duration: 0.04, ease: 'none' })
    .to(refs.ignite, { head: 1, duration: 0.26, ease: 'power2.out' })

  const flash = document.getElementById('ignite-flash')
  if (flash) {
    gsap.fromTo(
      flash,
      { opacity: 0 },
      { opacity: 0.4, duration: 0.12, repeat: 1, yoyo: true, ease: 'power2.out' }
    )
  }
}
