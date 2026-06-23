import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, AdditiveBlending } from 'three'
import { useSceneRefs } from './SceneRefs.jsx'

// Procedural raindrop ripples on the wet ground — expanding rings spawned per
// grid cell, concentrated around the car and fading toward the edges.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // a single small raindrop ripple inside a cell
  float drop(vec2 gv, vec2 nid){
    float h = hash(nid);
    float h2 = hash(nid + 4.3);
    float period = 0.9 + h * 0.9;                 // quick lifecycle
    float ph = fract(uTime / period + h);          // 0..1
    vec2 c = (vec2(hash(nid + 1.7), hash(nid + 9.1)) - 0.5) * 0.72;
    float d = length(gv - c);
    float radius = ph * 0.30;                       // small max radius
    float ring = smoothstep(0.022, 0.0, abs(d - radius));        // thin leading ring
    float ring2 = smoothstep(0.05, 0.0, abs(d - radius * 0.55)) * 0.35; // soft inner
    float life = pow(1.0 - ph, 1.8);                // fade quickly as it dies
    float born = smoothstep(0.0, 0.06, ph);         // pop in
    return (ring + ring2) * life * born * (0.55 + 0.45 * h2);
  }

  void main(){
    vec2 uv = vUv * 34.0;            // denser, smaller cells
    vec2 id = floor(uv);
    vec2 gv = fract(uv) - 0.5;
    float acc = 0.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 nid = id + vec2(float(x), float(y));
        acc += drop(gv - vec2(float(x), float(y)), nid);
      }
    }
    float fade = smoothstep(1.0, 0.15, length(vUv - 0.5) * 2.0); // concentrate near the car
    float a = clamp(acc, 0.0, 1.0) * uOpacity * fade;
    if (a < 0.008) discard;
    gl_FragColor = vec4(vec3(0.62, 0.71, 0.86), a);
  }
`

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export default function RainRipples() {
  const refs = useSceneRefs()
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.7 } },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    []
  )

  useFrame((state, dt) => {
    material.uniforms.uTime.value += Math.min(dt, 0.05)
    material.uniforms.uOpacity.value = 0.55 - 0.45 * (refs.studio || 0)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={material} frustumCulled={false}>
      <planeGeometry args={[46, 46]} />
    </mesh>
  )
}
