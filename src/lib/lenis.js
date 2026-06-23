// Holder so non-React modules (preloader handoff) can pause/resume scrolling.
// `wantStart` latches a start request that arrives before Lenis exists, so a
// late-constructed instance self-starts (guards against a permanent scroll
// freeze if the handoff fires while instance is null).
export const lenisHolder = { instance: null, wantStart: false }
export function lenisStop() {
  lenisHolder.wantStart = false
  lenisHolder.instance?.stop()
}
export function lenisStart() {
  lenisHolder.wantStart = true
  lenisHolder.instance?.start()
}
