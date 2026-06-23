import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  AdditiveBlending,
  Color,
} from 'three'
import { useSceneRefs } from './SceneRefs.jsx'

const COUNT = 6000
const AREA = 30 // horizontal spread around the camera
const HEIGHT = 26 // vertical fall range

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uHeight;
  attribute float aSpeed;
  attribute float aScale;
  attribute float aRand;
  varying float vRand;
  void main() {
    vRand = aRand;
    vec3 p = position;
    // continuous fall, wrapped into [0, uHeight]
    p.y = mod(p.y - uTime * aSpeed + aRand * uHeight, uHeight);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * aScale * (60.0 / -mv.z), 4.0, 64.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vRand;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // thin vertical streak: very narrow in x, soft along y
    float streak = smoothstep(0.5, 0.0, abs(c.x) * 7.0);
    float vert = smoothstep(0.5, -0.35, c.y); // brighter near the head of the drop
    float a = streak * (0.25 + 0.75 * vert) * uOpacity * (0.6 + 0.4 * vRand);
    if (a < 0.012) discard;
    gl_FragColor = vec4(uColor, a);
  }
`

export default function Rain() {
  const { camera } = useThree()
  const refs = useSceneRefs()

  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    const pos = new Float32Array(COUNT * 3)
    const speed = new Float32Array(COUNT)
    const scale = new Float32Array(COUNT)
    const rand = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * AREA
      pos[i * 3 + 1] = Math.random() * HEIGHT
      pos[i * 3 + 2] = (Math.random() - 0.5) * AREA
      speed[i] = 11 + Math.random() * 12
      scale[i] = 0.55 + Math.random() * 1.1
      rand[i] = Math.random()
    }
    g.setAttribute('position', new BufferAttribute(pos, 3))
    g.setAttribute('aSpeed', new BufferAttribute(speed, 1))
    g.setAttribute('aScale', new BufferAttribute(scale, 1))
    g.setAttribute('aRand', new BufferAttribute(rand, 1))
    return g
  }, [])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 1.9 },
          uHeight: { value: HEIGHT },
          uOpacity: { value: 0.85 },
          uColor: { value: new Color('#b8c6dc') },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    []
  )

  const group = useRef()

  useFrame((state, dt) => {
    material.uniforms.uTime.value += Math.min(dt, 0.05)
    // keep the rain volume centred on the camera so it's always around the view
    if (group.current) {
      group.current.position.set(
        camera.position.x,
        camera.position.y - HEIGHT * 0.5,
        camera.position.z
      )
    }
    // keep it pouring, but ease off during the bright studio panel
    const studio = refs.studio || 0
    material.uniforms.uOpacity.value = 0.9 - 0.7 * studio
  })

  return (
    <points ref={group} geometry={geometry} material={material} frustumCulled={false} />
  )
}
