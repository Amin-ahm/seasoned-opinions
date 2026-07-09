// Lazy-loaded 3D spinning wheel for "Decide for Me".
// The winner is already decided by the caller; GSAP spins the wheel and lands
// the chosen segment under the pointer with a satisfying ease-out.
import { useMemo, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Text, RoundedBox, Cylinder, Cone } from '@react-three/drei'
import gsap from 'gsap'

const PALETTE = [
  '#f24d1e',
  '#0d9488',
  '#f59e0b',
  '#4f46e5',
  '#16a34a',
  '#2563eb',
]

function truncate(str, n = 14) {
  if (!str) return '?'
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

function Wheel({ segments, targetRotation, spinKey, onSettled, reduced }) {
  const groupRef = useRef(null)
  const n = segments.length
  const step = (Math.PI * 2) / n

  useEffect(() => {
    const g = groupRef.current
    if (!g) return
    if (reduced) {
      g.rotation.z = targetRotation
      onSettled?.()
      return
    }
    const tween = gsap.fromTo(
      g.rotation,
      { z: 0 },
      {
        z: targetRotation,
        duration: 4.2,
        ease: 'power4.out',
        onComplete: () => onSettled?.(),
      }
    )
    return () => tween.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey])

  return (
    <group ref={groupRef}>
      {/* wheel face */}
      <Cylinder args={[3, 3, 0.3, 48]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#fff1e2" roughness={0.6} />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 0.5, 24]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#3a2a20" roughness={0.5} />
      </Cylinder>

      {segments.map((seg, i) => {
        const angle = i * step
        const r = 2.05
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        return (
          <group key={i} position={[x, y, 0.2]} rotation={[0, 0, angle]}>
            <RoundedBox args={[1.7, 0.8, 0.18]} radius={0.09}>
              <meshStandardMaterial
                color={PALETTE[i % PALETTE.length]}
                roughness={0.5}
              />
            </RoundedBox>
            <Text
              position={[0, 0, 0.12]}
              fontSize={0.24}
              maxWidth={1.5}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="rgba(0,0,0,0.25)"
            >
              {seg.emoji} {truncate(seg.name)}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

export default function DecideWheel({
  segments,
  winnerIndex,
  spinKey,
  onSettled,
  reduced = false,
}) {
  // Pointer sits at the top (angle = π/2). Land the winner segment there,
  // after several full turns for drama.
  const targetRotation = useMemo(() => {
    const n = Math.max(segments.length, 1)
    const step = (Math.PI * 2) / n
    const winnerAngle = winnerIndex * step
    const spins = 5
    return Math.PI * 2 * spins + (Math.PI / 2 - winnerAngle)
  }, [segments.length, winnerIndex, spinKey])

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />

      {/* Fixed pointer at the top, pointing down into the wheel */}
      <Cone args={[0.35, 0.7, 3]} position={[0, 3.25, 0.4]} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial color="#3a2a20" />
      </Cone>

      <Wheel
        segments={segments}
        targetRotation={targetRotation}
        spinKey={spinKey}
        onSettled={onSettled}
        reduced={reduced}
      />
    </Canvas>
  )
}
