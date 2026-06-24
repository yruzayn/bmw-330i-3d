# BMW 330i — Immersive 3D Scroll Experience

A dark, cinematic, scroll-driven 3D product site for the BMW 330i. A single
normalized scroll value drives the camera, the car, the lighting, the weather,
the audio, and the typography — one continuous shot from a rainy black void to a
full spec reveal.

## The scroll sequence

1. **Complete dark + rain** — the car is hidden; rain falls and beads on the wet road
2. **Headlights ignite** — head-on and dead straight, only the emissive headlights cut the dark (engine ignition sound fires)
3. **Red "330i" + text** — a giant red wordmark rises behind the car, lit by the red taillights spilling onto the wet ground; the headline reveals
4. **Doors open** — the car's doors swing open, then close as it turns
5. **Studio flip** — background snaps to a high-key studio for a clean side profile
6. **Performance** — rear-3/4, taillights blazing, a live 0–100 km/h telemetry read-out
7. **Rear / assist / powertrain** — exhaust, driver-assist, and the full spec grid

## Highlights

- **Real reflections** — a night-city HDRI lights the scene; the clearcoat paint and wet road reflect it physically
- **Wet asphalt road** — real PBR asphalt textures; ripples distort the actual reflections via an animated water-normal (no fake glow rings)
- **GPU rain** — shader-based rain with depth falloff and wind shear
- **Rigged doors** — each door hinged at its front edge, opening/closing on scroll
- **Audio** — synthesized engine-ignition swell on headlights-on, with a sound toggle (autoplay-safe)
- **Live PBR paint switcher** — recolour the car's clearcoat in real time
- **Bold automotive typography** — wide industrial Archivo Expanded display type
- **Smooth scroll** — Lenis + GSAP, aspect-aware framing for mobile

## Stack

React 18 · Vite · three.js r168 · @react-three/fiber + drei · @react-three/postprocessing (Bloom/Vignette/Noise/CA) · GSAP + ScrollTrigger · Lenis · Web Audio.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
```

The optimized Draco model, HDRI, and PBR textures are committed, so it runs out
of the box. Scroll from the very top for the full sequence; click anywhere (or
scroll) once to enable sound.

## The 3D model

Source `BMW 330i.glb` is 54.6 MB; the committed `public/models/bmw-330i.glb` is a
~5 MB Draco + WebP build. Regenerate with `npm run optimize:model` (see
`scripts/optimize-model.mjs` — a discrete resize → webp → draco pipeline that
preserves node names so the light/door rigs keep working).

## Project map

- `src/lib/choreography.js` — the keyframe timeline (camera, car, lights, weather)
- `src/scene/Director.jsx` — the single `useFrame` that applies it all
- `src/scene/Car.jsx` — GLB load, normalize, light + door rigs
- `src/scene/{Rain,Floor,Road,Env,HeroWord}.jsx` — weather, wet road, HDRI, red wordmark
- `src/lib/audio.js` — Web Audio ignition
- `src/lib/sections.js` / `paints.js` — copy + paint options
