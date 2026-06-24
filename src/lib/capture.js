// Deterministic capture mode — enabled with ?capture in the URL. Used by the
// offline 4K render: the app stops driving itself (no Lenis, no rAF loop, no
// preloader) and is stepped frame-by-frame via window.__cap.frame(progress, dt)
// with a virtual clock, so every frame is rendered at an exact timestep.
export const CAPTURE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('capture')
