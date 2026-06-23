import { useLayoutEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3, Color } from 'three'
import { useSceneRefs } from './SceneRefs.jsx'

const MODEL_URL = '/models/bmw-330i.glb'
const CAR_LENGTH = 4.5 // target world length (meters)
const HIDE = new Set(['Object_10', 'Cube', 'Plane']) // authored backdrop junk

const HEAD_EMISSIVE = new Color('#eaf2ff') // cold xenon
const GRILLE_EMISSIVE = new Color('#dfe9ff')
const TAIL_EMISSIVE = new Color('#ff2a30')
const DEFAULT_PAINT = '#0a0e14' // Black Sapphire

const isFrontNode = (n) => /Light_F|Bumper_F/.test(n)
const isRearNode = (n) => /Light_B|Bumper_B|Trunk/.test(n)

export default function Car() {
  const refs = useSceneRefs()
  const { scene } = useGLTF(MODEL_URL, '/draco/')
  const rigRef = useRef()

  useLayoutEffect(() => {
    const root = scene
    root.position.set(0, 0, 0)
    root.rotation.set(0, 0, 0)
    root.scale.set(1, 1, 1)

    const headlights = []
    const taillights = []
    const grille = []
    const paintSet = new Set()
    let frontProbe = null
    let rearProbe = null

    const cloneAndEmissive = (mesh, emissiveColor) => {
      const arr = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const cloned = arr.map((m) => {
        const c = m.clone()
        c.emissive = emissiveColor.clone()
        c.emissiveIntensity = 0
        c.toneMapped = false // let bloom blow them out cleanly
        c.needsUpdate = true
        return c
      })
      mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0]
      return cloned
    }

    root.traverse((o) => {
      if (!o.isMesh) return
      if (HIDE.has(o.name)) {
        o.visible = false
        return
      }
      o.frustumCulled = false
      o.castShadow = false
      o.receiveShadow = false

      const arr = Array.isArray(o.material) ? o.material : [o.material]
      const matNames = arr.map((m) => m.name)
      const name = o.name

      // BODY PAINT — keep the shared material instance so one switch recolors all.
      for (const m of arr) {
        if (m.name === 'CarPaint' && !paintSet.has(m)) {
          paintSet.add(m)
          m.color = new Color(DEFAULT_PAINT)
          if ('clearcoat' in m) {
            m.clearcoat = 1.0
            m.clearcoatRoughness = 0.08
          }
          m.metalness = 0.9
          m.roughness = 0.3
          m.envMapIntensity = 1.4
          m.needsUpdate = true
        }
      }

      // LIGHTS — clone per-mesh so front (white) and rear (red) animate apart.
      const hasLightMat = matNames.some((n) =>
        ['MI_Glass_Light', 'MI_Light.005', 'reD_glass'].includes(n)
      )
      const hasGrille = matNames.includes('MI_Logo')

      if (matNames.includes('reD_glass') || (hasLightMat && isRearNode(name))) {
        taillights.push(...cloneAndEmissive(o, TAIL_EMISSIVE))
        if (!rearProbe) rearProbe = o
      } else if (hasLightMat && isFrontNode(name)) {
        headlights.push(...cloneAndEmissive(o, HEAD_EMISSIVE))
        if (!frontProbe) frontProbe = o
      }

      // GRILLE / front badge accent.
      if (hasGrille && isFrontNode(name)) {
        grille.push(...cloneAndEmissive(o, GRILLE_EMISSIVE))
        if (!frontProbe) frontProbe = o
      }
    })

    // World-space center of a mesh's geometry (node origins are baked at the
    // model center, so we must use the geometry bbox, not getWorldPosition).
    const worldCenterOf = (mesh) => {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
      const c = mesh.geometry.boundingBox.getCenter(new Vector3())
      mesh.updateWorldMatrix(true, false)
      return c.applyMatrix4(mesh.matrixWorld)
    }

    // ---- Normalize transform (scale, facing, ground, center) ----
    const worldBox = () => {
      const box = new Box3()
      const tmp = new Box3()
      root.updateMatrixWorld(true)
      root.traverse((o) => {
        if (o.isMesh && o.visible) {
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox()
          tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld)
          box.union(tmp)
        }
      })
      return box
    }

    let box = worldBox()
    const size = box.getSize(new Vector3())

    // Align the longest horizontal axis to X.
    if (size.z > size.x) root.rotation.y = -Math.PI / 2
    const length = Math.max(size.x, size.z)
    root.scale.setScalar(CAR_LENGTH / length)
    root.updateMatrixWorld(true)

    // Ensure the nose points +X (translation-invariant comparison).
    if (frontProbe && rearProbe) {
      const fp = worldCenterOf(frontProbe)
      const rp = worldCenterOf(rearProbe)
      if (fp.x < rp.x) root.rotation.y += Math.PI
      root.updateMatrixWorld(true)
    }

    // Recenter on XZ and rest the wheels on y = 0.
    box = worldBox()
    const center = box.getCenter(new Vector3())
    root.position.x -= center.x
    root.position.z -= center.z
    root.position.y -= box.min.y
    root.updateMatrixWorld(true)

    // Publish handles.
    refs.carRig.current = rigRef.current
    refs.headlights = headlights
    refs.taillights = taillights
    refs.grille = grille
    refs.paint = [...paintSet]
    refs.paintColor.set(DEFAULT_PAINT)
    refs.paintColorCurrent.set(DEFAULT_PAINT)
    refs.ready = true

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  return (
    <group ref={rigRef}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, '/draco/')
