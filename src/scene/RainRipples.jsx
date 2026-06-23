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

  void main(){
    vec2 uv = vUv * 15.0;            // cells across the plane
    vec2 id = floor(uv);
    vec2 gv = fract(uv) - 0.5;
    float acc = 0.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 nid = id + vec2(float(x), float(y));
        float h = hash(nid);
        float h2 = hash(nid + 3.3);
        vec2 center = vec2(float(x), float(y)) + (vec2(hash(nid + 1.0), hash(nid + 2.0)) - 0.5) * 0.6;
        float d = length(gv - center);
        float period = 1.5 + h * 1.6;
        float ph = fract(uTime / period + h);     // 0..1 ripple life
        float radius = ph * 0.5;
        float ring = smoothstep(0.045, 0.0, abs(d - radius));
        float life = 1.0 - ph;
        acc += ring * life * life * (0.45 + 0.55 * h2);
      }
    }
    float fade = smoothstep(1.0, 0.2, length(vUv - 0.5) * 2.0); // concentrate near centre
    float a = clamp(acc, 0.0, 1.0) * uOpacity * fade;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.66, 0.74, 0.9), a);
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
