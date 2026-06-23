import { Environment } from '@react-three/drei'

// Real night-city HDRI for physically-plausible reflections on the car's
// clearcoat and the wet road. background stays false so we keep the solid
// graded backdrop; intensity is modulated per-section via
// scene.environmentIntensity in the Director (0 during the dark intro → up).
export default function Env() {
  return <Environment files="/hdri/city_night.hdr" background={false} />
}
