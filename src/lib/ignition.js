// The headlights now ignite via SCROLL (choreo.headlights ramps 0→1 over the
// opening), so the preloader handoff just ENABLES the light multipliers — no
// screen flash or strobe, which would be jarring against the dark, rainy intro.
export function igniteLights(refs) {
  refs.ignite.head = 1
  refs.ignite.tail = 1
}
