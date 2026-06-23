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

const COUNT = 8500
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
  varying float vDepth;
  void main() {
    vRand = aRand;
    vec3 p = position;
    // continuous fall, wrapped into [0, uHeight]
    p.y = mod(p.y - uTime * aSpeed + aRand * uHeight, uHeight);
    // slight wind shear so the rain isn't perfectly vertical
    p.x += (p.y / uHeight) * 1.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * aScale * (55.0 / -mv.z), 3.0, 52.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vRand;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // thin vertical streak: very narrow in x, soft along y
    float streak = smoothstep(0.5, 0.0, abs(c.x) * 10.0);
    float vert = smoothstep(0.5, -0.4, c.y); // brighter near the head of the drop
    // fade distant rain so depth reads
    float depthFade = 1.0 - clamp((vDepth - 3.0) / 26.0, 0.0, 1.0) * 0.7;
    float a = streak * (0.2 + 0.8 * vert) * uOpacity * (0.45 + 0.55 * vRand) * depthFade;
    if (a < 0.01) discard;
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
