import { Vector3, Color, MathUtils } from 'three'

const D2R = Math.PI / 180

// NOCTURNE/330 timeline. Each keyframe is anchored to a normalized scroll
// position `at` (0..1). Coordinate convention (enforced in Car.jsx): the car is
// centered at the origin, wheels on y=0, scaled so its LENGTH ≈ 4.5 units with
// the nose facing +X (tail −X). carYaw is monotonic 0°→−360° (one full
// revolution — motion always reads forward). Units are world meters; FOV 38°.
export const KEYFRAMES = [
  {
    // 00a — INTRO. Complete darkness, only rain. Head-on FRONT, car dead straight.
    at: 0.0,
    pos: [6.4, 1.06, 0.0],
    target: [0, 0.72, 0],
    carYaw: 0,
    bg: '#000000',
    fogNear: 5,
    fogFar: 18,
    exposure: 0.78,
    env: 0.0,
    studio: 0,
    headlights: 0.0,
    taillights: 0.0,
  },
  {
    // 00b — LIGHTS. Headlights ignite in the dark. Still straight, body still black.
    at: 0.05,
    pos: [6.4, 1.06, 0.0],
    target: [0, 0.72, 0],
    carYaw: 0,
    bg: '#010103',
    fogNear: 5,
    fogFar: 18,
    exposure: 0.92,
    env: 0.03,
    studio: 0,
    headlights: 1.0,
    taillights: 0.12,
  },
  {
    // 00c — HERO TEXT. Car emerges from darkness; headline reveals. Straight front.
    at: 0.12,
    pos: [5.9, 1.08, 0.35],
    target: [0, 0.74, 0],
    carYaw: 0,
    bg: '#050506',
    fogNear: 7,
    fogFar: 20,
    exposure: 1.0,
    env: 0.24,
    studio: 0,
    headlights: 1.0,
    taillights: 0.16,
  },
  {
    // 01 — OVERVIEW. The car begins to rotate toward a front-3/4.
    at: 0.214,
    pos: [1.0, 1.3, 6.2],
    target: [0, 0.85, 0],
    carYaw: -62,
    bg: '#060709',
    fogNear: 8,
    fogFar: 26,
    exposure: 1.05,
    env: 0.5,
    studio: 0,
    headlights: 0.5,
    taillights: 0.1,
  },
  {
    // 02 — DESIGN. The FLIP — decisive snap to high-key studio, clean profile.
    at: 0.357,
    pos: [0.0, 1.05, 6.7],
    target: [0, 0.8, 0],
    carYaw: -180,
    bg: '#ececee',
    fogNear: 14,
    fogFar: 42,
    exposure: 1.32,
    env: 1.1,
    studio: 1,
    headlights: 0.0,
    taillights: 0.0,
  },
  {
    // 03 — PERFORMANCE. Dark slams back; rear 3/4, taillights fire hard.
    at: 0.5,
    pos: [-4.4, 1.05, 4.8],
    target: [-0.4, 0.7, 0],
    carYaw: -285,
    bg: '#050506',
    fogNear: 6,
    fogFar: 22,
    exposure: 1.0,
    env: 0.42,
    studio: 0,
    headlights: 0.18,
    taillights: 1.0,
  },
  {
    // 04 — REAR / EXHAUST. Straight-on low rear hero.
    at: 0.643,
    pos: [-5.6, 0.95, 1.8],
    target: [-1.0, 0.6, 0],
    carYaw: -340,
    bg: '#070506',
    fogNear: 7,
    fogFar: 24,
    exposure: 0.96,
    env: 0.46,
    studio: 0,
    headlights: 0.1,
    taillights: 1.0,
  },
  {
    // 05 — ASSIST. High side sweep.
    at: 0.786,
    pos: [-2.6, 2.6, 5.2],
    target: [-0.2, 0.65, 0],
    carYaw: -390,
    bg: '#06070a',
    fogNear: 9,
    fogFar: 30,
    exposure: 1.05,
    env: 0.55,
    studio: 0,
    headlights: 0.35,
    taillights: 0.6,
  },
  {
    // 06 — POWERTRAIN / OUTRO. Pull back to front-side; re-ignite everything.
    at: 0.95,
    pos: [5.0, 1.5, 5.6],
    target: [0, 0.8, 0],
    carYaw: -408,
    bg: '#050506',
    fogNear: 8,
    fogFar: 26,
    exposure: 0.86,
    env: 0.5,
    studio: 0,
    headlights: 1.0,
    taillights: 1.0,
  },
]

const _a = new Vector3()
const _b = new Vector3()
const _ca = new Color()
const _cb = new Color()

function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export function createChoreoState() {
  return {
    pos: new Vector3(6.4, 1.06, 0.0),
    target: new Vector3(0, 0.72, 0),
    bg: new Color('#000000'),
    carYaw: 0,
    fogNear: 5,
    fogFar: 18,
    exposure: 0.16,
    env: 0.0,
    studio: 0,
    headlights: 0,
    taillights: 0,
  }
}

// Sample the timeline at progress `p`, writing into `out` (mutated in place).
export function sampleChoreo(p, out) {
  const k = KEYFRAMES
  let i = 0
  while (i < k.length - 1 && p > k[i + 1].at) i++
  const a = k[i]
  const b = k[Math.min(i + 1, k.length - 1)]
  const span = b.at - a.at || 1
  const tRaw = MathUtils.clamp((p - a.at) / span, 0, 1)
  const t = smootherstep(tRaw)

  _a.set(a.pos[0], a.pos[1], a.pos[2])
  _b.set(b.pos[0], b.pos[1], b.pos[2])
  out.pos.lerpVectors(_a, _b, t)

  _a.set(a.target[0], a.target[1], a.target[2])
  _b.set(b.target[0], b.target[1], b.target[2])
  out.target.lerpVectors(_a, _b, t)

  _ca.set(a.bg)
  _cb.set(b.bg)
  out.bg.copy(_ca).lerp(_cb, t)

  out.carYaw = MathUtils.lerp(a.carYaw, b.carYaw, t) * D2R
  out.fogNear = MathUtils.lerp(a.fogNear, b.fogNear, t)
  out.fogFar = MathUtils.lerp(a.fogFar, b.fogFar, t)
  out.exposure = MathUtils.lerp(a.exposure, b.exposure, t)
  out.env = MathUtils.lerp(a.env, b.env, t)
  out.studio = MathUtils.lerp(a.studio, b.studio, t)
  out.headlights = MathUtils.lerp(a.headlights, b.headlights, t)
  out.taillights = MathUtils.lerp(a.taillights, b.taillights, t)
  return out
}
