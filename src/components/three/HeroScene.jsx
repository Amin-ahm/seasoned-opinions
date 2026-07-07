// Lazy-loaded hero scene: a few gently bobbing low-poly food characters.
// Default export so it can be React.lazy()'d. Fully optional - the app is
// completely usable if this never loads.
import { Canvas } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import { CoffeeCup, Croissant, MapPin, Donut } from './FoodModels'

export default function HeroScene({ simplified = false }) {
  return (
    <Canvas
      dpr={[1, simplified ? 1.5 : 2]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} color="#ffd9c4" />

      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.9}>
        <CoffeeCup position={[-2.1, 0.4, 0]} rotation={[0.1, -0.3, 0.05]} scale={1.05} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.1}>
        <Croissant position={[0, -0.3, 0.5]} rotation={[0.2, 0.4, 0]} scale={1.15} />
      </Float>
      <Float speed={2.4} rotationIntensity={0.7} floatIntensity={1}>
        <MapPin position={[2.1, 0.6, -0.4]} rotation={[0, 0.2, 0.1]} scale={1} />
      </Float>
      {!simplified && (
        <Float speed={1.8} rotationIntensity={1} floatIntensity={1.2}>
          <Donut position={[1.2, -1.1, 0.6]} rotation={[0.3, 0, 0.2]} scale={0.9} />
        </Float>
      )}

      <Environment preset="sunset" />
    </Canvas>
  )
}
