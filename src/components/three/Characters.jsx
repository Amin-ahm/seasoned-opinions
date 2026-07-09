// Chunky, low-poly, rounded characters with a little googly personality.
// Theme-neutral (not food): a location pin, a speech bubble, a lightbulb, a
// heart, and a gem. They stand in for discovery, opinions, ideas, favorites,
// and quality. Built from cheap primitives, no external model files.
import { RoundedBox, Sphere, Cylinder, Cone, Octahedron } from '@react-three/drei'

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

// Location pin, for discovering places.
export function Pin(props) {
  return (
    <group {...props}>
      <Sphere args={[0.5, 24, 24]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#f24d1e" roughness={0.45} />
      </Sphere>
      <Cone args={[0.42, 0.7, 24]} position={[0, -0.42, 0]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial color="#f24d1e" roughness={0.45} />
      </Cone>
      <Sphere args={[0.18, 20, 20]} position={[0, 0.25, 0.34]}>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </Sphere>
    </group>
  )
}

// Speech bubble, for opinions and reviews.
export function ChatBubble(props) {
  return (
    <group {...props}>
      <RoundedBox args={[1.3, 0.95, 0.5]} radius={0.22} smoothness={4}>
        <meshStandardMaterial color="#f24d1e" roughness={0.5} />
      </RoundedBox>
      <Cone args={[0.22, 0.4, 4]} position={[-0.35, -0.6, 0]} rotation={[0, Math.PI / 4, 0.4]}>
        <meshStandardMaterial color="#f24d1e" roughness={0.5} />
      </Cone>
      {/* three little dots */}
      {[-0.32, 0, 0.32].map((x) => (
        <Sphere key={x} args={[0.09, 16, 16]} position={[x, 0, 0.26]}>
          <meshStandardMaterial color="#fff1e2" roughness={0.4} />
        </Sphere>
      ))}
    </group>
  )
}

// Lightbulb, for ideas and tips.
export function Bulb(props) {
  return (
    <group {...props}>
      <Sphere args={[0.5, 24, 24]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#ffc857" roughness={0.35} metalness={0.1} />
      </Sphere>
      <Cylinder args={[0.26, 0.3, 0.35, 20]} position={[0, -0.28, 0]}>
        <meshStandardMaterial color="#cfd6de" roughness={0.5} metalness={0.3} />
      </Cylinder>
      <Eyes y={0.28} z={0.42} spread={0.16} scale={0.85} />
    </group>
  )
}

// Heart, for favorites.
export function Heart(props) {
  return (
    <group {...props} rotation={[0, 0, Math.PI]}>
      <Cone args={[0.62, 1, 24]} position={[0, 0.28, 0]}>
        <meshStandardMaterial color="#e11d48" roughness={0.5} />
      </Cone>
      <Sphere args={[0.33, 20, 20]} position={[-0.3, -0.28, 0]}>
        <meshStandardMaterial color="#e11d48" roughness={0.5} />
      </Sphere>
      <Sphere args={[0.33, 20, 20]} position={[0.3, -0.28, 0]}>
        <meshStandardMaterial color="#e11d48" roughness={0.5} />
      </Sphere>
    </group>
  )
}

// Gem, for quality picks.
export function Gem(props) {
  return (
    <group {...props}>
      <Octahedron args={[0.6, 0]}>
        <meshStandardMaterial color="#0d9488" roughness={0.25} metalness={0.2} flatShading />
      </Octahedron>
      <Eyes y={0.05} z={0.42} spread={0.15} scale={0.8} />
    </group>
  )
}

export const CHARACTERS = [Pin, ChatBubble, Bulb, Heart, Gem]
