// Module-level singleton shared between the Lenis scroll callback (writer)
// and the R3F render loop (reader). Avoids React re-renders at 60fps.
export const scrollState = {
  progress: 0, // 0..1 across the whole page
  velocity: 0,
  sectionCount: 7,
}

const listeners = new Set()

export function setProgress(p, v = 0) {
  scrollState.progress = p
  scrollState.velocity = v
  for (const fn of listeners) fn(p, v)
}

// Subscribe to progress updates (used by light UI like the counter).
export function onProgress(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Single source of scroll progress for the 3D scene. In dev, a `window.__forceP`
// override pins it (the preview screenshot tool moves the real scroll position,
// so this lets us verify a specific moment).
export function getProgress() {
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.__forceP != null) {
    return window.__forceP
  }
  return scrollState.progress
}
