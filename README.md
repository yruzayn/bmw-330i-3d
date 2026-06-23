# BMW 330i — "NOCTURNE/330"

An award-grade, dark-theme 3D product site for the BMW 330i. As you scroll, a
single normalized progress value drives the camera, the car's rotation, the
lighting, the background, and the typography — one continuous cinematic shot
broken into seven panels.

![hero](public/models/) <!-- see live -->

## Stack

- **React 18 + Vite**
- **three.js r168** via **@react-three/fiber** + **@react-three/drei**
- **@react-three/postprocessing** — Bloom / Vignette / Noise / Chromatic Aberration
- **GSAP + ScrollTrigger** — text reveals, preloader, ignition
- **Lenis** — smooth scroll (feeds the single scroll-progress value)

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
```

## The 3D model

The source asset `G:/Downloads/bmw-330i/source/BMW 330i.glb` is **54.6 MB** — far
too heavy for the web. The committed `public/models/bmw-330i.glb` is a **~5 MB**
optimized build (Draco geometry + resized WebP textures). Regenerate it with:

```bash
npm run optimize:model
```

This runs a **discrete** `resize -> webp -> draco` pipeline (see
`scripts/optimize-model.mjs`). It deliberately avoids `gltf-transform optimize`,
whose mesh-joining would merge the headlight/taillight clusters and break the
per-light ignition.

The Draco decoders are vendored in `public/draco/` so the site works offline.

## How it works

- **`src/lib/choreography.js`** — the keyframe timeline. Each keyframe holds a
  camera position/target, car yaw, background, fog, exposure, environment
  intensity, and headlight/taillight levels. `sampleChoreo(p)` interpolates
  between keyframes with smootherstep (no per-frame allocations).
- **`src/scene/Director.jsx`** — the single `useFrame` that reads the scroll
  progress and applies everything (camera, car rotation, tone, emissives, the
  DOM studio-flip). Aspect-aware framing widens the FOV on narrow viewports.
- **`src/scene/Car.jsx`** — loads the GLB, hides the authored backdrop, caches
  material handles (`CarPaint`, headlight/taillight lenses, grille), and
  normalizes the model at runtime (scale to 4.5 m, nose to +X, wheels to y=0).
- **`src/lib/scroll.js` + `src/components/SmoothScroll.jsx`** — Lenis writes a
  single `progress` value consumed by the Director and the UI chrome.

### Signature moments

1. **Headlight ignition** — fired as the preloader iris reveals the hero (real
   bulb-inrush flicker + screen flash).
2. **Dark → studio flip** (section 02) — canvas background, fog, exposure,
   environment and the DOM text colour all invert from one shared value.
3. **Live PBR paint switcher + telemetry HUD** — recolour the car's clearcoat in
   real time; the 0–100 km/h read-out tracks the performance panel.

## Tuning

All shot composition lives in `KEYFRAMES` in `src/lib/choreography.js` — edit a
keyframe's `pos`, `target`, `carYaw`, `bg`, `headlights`, etc. and it updates
live. Section copy is in `src/lib/sections.js`; paint options in
`src/lib/paints.js`.
