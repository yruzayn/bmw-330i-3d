// Reproducible model optimization: 54.6 MB raw GLB -> ~5 MB web-ready GLB.
// Uses DISCRETE gltf-transform commands (resize -> webp -> draco). We must NOT
// use `gltf-transform optimize`, because its default pipeline joins meshes by
// material — that would merge the front/rear light clusters (they share
// MI_Glass_Light / MI_Light.005) and destroy the per-mesh node names this app
// relies on to ignite headlights vs taillights independently.
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'

const SRC = 'G:/Downloads/bmw-330i/source/BMW 330i.glb'
const OUT = 'public/models/bmw-330i.glb'
const T1 = 'tmp-resize.glb'
const T2 = 'tmp-webp.glb'

const run = (...args) =>
  execFileSync('npx', ['gltf-transform', ...args], { stdio: 'inherit', shell: true })

mkdirSync('public/models', { recursive: true })
console.log('1/3 resize textures -> 2048')
run('resize', SRC, T1, '--width', '2048', '--height', '2048')
console.log('2/3 webp compress')
run('webp', T1, T2, '--quality', '80')
console.log('3/3 draco geometry compression')
run('draco', T2, OUT)
rmSync(T1, { force: true })
rmSync(T2, { force: true })
console.log('done ->', OUT)
