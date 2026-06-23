// Lightweight Web Audio engine — rain ambience + an ignition swell, synthesized
// so it needs no assets and works offline. Audio is created lazily on the first
// user gesture (enable), satisfying browser autoplay rules. Drop a real engine
// sample in later by replacing playIgnition() with a buffer source if desired.
let ctx = null
let master = null
let rainGain = null
let enabled = false
let ignited = false

function build() {
  if (ctx) return
  const AC = window.AudioContext || window.webkitAudioContext
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  // ---- rain ambience: brown-ish noise through band shaping ----
  const len = Math.floor(ctx.sampleRate * 4)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = white * 0.35 + last * 2.2
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 420
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 6500
  rainGain = ctx.createGain()
  rainGain.gain.value = 0.34
  // gentle "wind" wobble on the lowpass for life
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.08
  lfoGain.gain.value = 1400
  lfo.connect(lfoGain)
  lfoGain.connect(lp.frequency)
  lfo.start()
  src.connect(hp)
  hp.connect(lp)
  lp.connect(rainGain)
  rainGain.connect(master)
  src.start()
}

export function setEnabled(on) {
  build()
  ctx.resume?.()
  enabled = on
  const t = ctx.currentTime
  master.gain.cancelScheduledValues(t)
  master.gain.linearRampToValueAtTime(on ? 0.6 : 0, t + 0.5)
}

export function isEnabled() {
  return enabled
}

// Deep ignition: a starter thunk + a short rev that settles into a soft idle.
export function playIgnition() {
  if (!ctx || !enabled || ignited) return
  ignited = true
  const t = ctx.currentTime

  // starter crank — short filtered-noise burst
  const nlen = Math.floor(ctx.sampleRate * 0.5)
  const nbuf = ctx.createBuffer(1, nlen, ctx.sampleRate)
  const nd = nbuf.getChannelData(0)
  for (let i = 0; i < nlen; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nlen)
  const nsrc = ctx.createBufferSource()
  nsrc.buffer = nbuf
  const nbp = ctx.createBiquadFilter()
  nbp.type = 'bandpass'
  nbp.frequency.value = 90
  nbp.Q.value = 1.2
  const ng = ctx.createGain()
  ng.gain.value = 0.5
  nsrc.connect(nbp)
  nbp.connect(ng)
  ng.connect(master)
  nsrc.start(t)

  // rev — two detuned saws ramping up then settling to idle
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.32, t + 0.18)
  g.gain.linearRampToValueAtTime(0.16, t + 1.6)
  g.gain.linearRampToValueAtTime(0.07, t + 3.4)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(900, t)
  lp.frequency.linearRampToValueAtTime(2200, t + 0.6)
  lp.frequency.linearRampToValueAtTime(700, t + 2.5)
  g.connect(lp)
  lp.connect(master)
  for (const detune of [0, -8, 7]) {
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.detune.value = detune
    o.frequency.setValueAtTime(42, t)
    o.frequency.exponentialRampToValueAtTime(165, t + 0.7)
    o.frequency.exponentialRampToValueAtTime(64, t + 1.9)
    o.connect(g)
    o.start(t)
    o.stop(t + 3.6)
  }
  // sub rumble
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(38, t)
  sub.frequency.exponentialRampToValueAtTime(60, t + 0.7)
  const sg = ctx.createGain()
  sg.gain.setValueAtTime(0, t)
  sg.gain.linearRampToValueAtTime(0.22, t + 0.3)
  sg.gain.linearRampToValueAtTime(0.0, t + 3.4)
  sub.connect(sg)
  sg.connect(master)
  sub.start(t)
  sub.stop(t + 3.6)
}

export function resetIgnition() {
  ignited = false
}
