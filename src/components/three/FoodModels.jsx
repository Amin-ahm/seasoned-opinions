// Chunky, low-poly, rounded food characters with a little googly personality.
// Built from cheap primitives + drei's RoundedBox - no external model files.
import { RoundedBox, Sphere, Cylinder, Cone, Torus } from '@react-three/drei'

// A pair of googly eyes that can be dropped onto any character.
function Eyes({ y = 0.15, z = 0.5, spread = 0.22, scale = 1 }) {
  return (
    <group position={[0, y, z]} scale={scale}>
      {[-spread, spread].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Sphere args={[0.11, 16, 16]}>
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </Sphere>
          <Sphere args={[0.055, 16, 16]} position={[0, -0.01, 0.08]}>
            <meshStandardMaterial color="#2a1a12" roughness={0.3} />
          </Sphere>
        </group>
      ))}
    </group>
  )
}

export function CoffeeCup(props) {
  return (
    <group {...props}>
      <Cylinder args={[0.55, 0.42, 0.9, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ff7a45" roughness={0.5} />
      </Cylinder>
      {/* handle */}
      <Torus args={[0.28, 0.09, 12, 24]} position={[0.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#f2612c" roughness={0.5} />
      </Torus>
      {/* coffee top */}
      <Cylinder args={[0.5, 0.5, 0.06, 32]} position={[0, 0.46, 0]}>
        <meshStandardMaterial color="#5b3a29" roughness={0.6} />
      </Cylinder>
      <Eyes y={0.1} z={0.5} spread={0.2} />
    </group>
  )
}

export function Croissant(props) {
  return (
    <group {...props}>
      <Torus args={[0.5, 0.26, 16, 32, Math.PI * 1.3]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#ffc857" roughness={0.55} />
      </Torus>
      <Eyes y={0.05} z={0.42} spread={0.16} scale={0.85} />
    </group>
  )
}

export function MapPin(props) {
  return (
    <group {...props}>
      <Sphere args={[0.5, 24, 24]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#ff5d8f" roughness={0.45} />
      </Sphere>
      <Cone args={[0.42, 0.7, 24]} position={[0, -0.42, 0]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial color="#ff5d8f" roughness={0.45} />
      </Cone>
      <Sphere args={[0.18, 20, 20]} position={[0, 0.25, 0.34]}>
        <meshStandardMaterial color="#fff1e2" roughness={0.4} />
      </Sphere>
    </group>
  )
}

export function Donut(props) {
  return (
    <group {...props}>
      <Torus args={[0.45, 0.22, 20, 32]} rotation={[Math.PI / 2.4, 0, 0]}>
        <meshStandardMaterial color="#c68642" roughness={0.6} />
      </Torus>
      <Torus args={[0.45, 0.2, 20, 32]} rotation={[Math.PI / 2.4, 0, 0]} position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#ff9ecb" roughness={0.5} />
      </Torus>
      <Eyes y={0.18} z={0.42} spread={0.14} scale={0.8} />
    </group>
  )
}

export function Burger(props) {
  return (
    <group {...props}>
      <RoundedBox args={[1, 0.35, 1]} radius={0.16} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#e9a54b" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[1.05, 0.18, 1.05]} radius={0.06} position={[0, 0.08, 0]}>
        <meshStandardMaterial color="#57b04a" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.95, 0.22, 0.95]} radius={0.06} position={[0, -0.12, 0]}>
        <meshStandardMaterial color="#7a3d22" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[1, 0.3, 1]} radius={0.16} position={[0, -0.38, 0]}>
        <meshStandardMaterial color="#e9a54b" roughness={0.6} />
      </RoundedBox>
      <Eyes y={0.4} z={0.5} spread={0.22} />
    </group>
  )
}

export const FOOD_COMPONENTS = [CoffeeCup, Croissant, MapPin, Donut, Burger]
