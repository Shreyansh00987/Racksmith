'use client'

import React, { useMemo } from 'react'
import { CaseData } from '../lib/validation'
import { Text } from '@react-three/drei'

const SCALE = 0.1
const U = 128.5 * SCALE

interface Case3DProps {
  currentCase: CaseData
}

export function Case3D({ currentCase }: Case3DProps) {
  const width = currentCase.hp * 5.08 * SCALE
  const depth = currentCase.maxDepthMM * SCALE
  const thickness = 6 * SCALE // 6mm wall thickness

  // Distribute power headers along the bus board
  const powerHeaders = useMemo(() => {
    const headers: number[] = []
    const headerCount = Math.max(3, Math.floor(currentCase.hp / 8))
    const step = (width * 0.85) / headerCount
    for (let i = 0; i < headerCount; i++) {
      headers.push(width * 0.1 + (i * step))
    }
    return headers
  }, [width, currentCase.hp])

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Case Back Enclosure Plate */}
      <mesh position={[width / 2, 0, -depth - thickness / 2]}>
        <boxGeometry args={[width + thickness * 2, U + thickness * 2, thickness]} />
        <meshStandardMaterial color="#1e222b" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* 2. Left Wooden / Anodized Cheek */}
      <mesh position={[-thickness / 2, 0, -depth / 2]}>
        <boxGeometry args={[thickness, U + thickness * 2, depth + thickness]} />
        <meshStandardMaterial color="#5c3821" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* 3. Right Wooden / Anodized Cheek */}
      <mesh position={[width + thickness / 2, 0, -depth / 2]}>
        <boxGeometry args={[thickness, U + thickness * 2, depth + thickness]} />
        <meshStandardMaterial color="#5c3821" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* 4. Top Case Lip */}
      <mesh position={[width / 2, U / 2 + thickness / 2, -depth / 2]}>
        <boxGeometry args={[width, thickness, depth + thickness]} />
        <meshStandardMaterial color="#262a34" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 5. Bottom Case Lip */}
      <mesh position={[width / 2, -U / 2 - thickness / 2, -depth / 2]}>
        <boxGeometry args={[width, thickness, depth + thickness]} />
        <meshStandardMaterial color="#262a34" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 6. Precision Extruded Eurorack Rails (Top and Bottom) */}
      <mesh position={[width / 2, U / 2 - 0.15, -0.15]}>
        <boxGeometry args={[width, 0.45, 0.45]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[width / 2, -U / 2 + 0.15, -0.15]}>
        <boxGeometry args={[width, 0.45, 0.45]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 7. Internal Power Bus Board (Green Glass-Epoxy PCB) */}
      <mesh position={[width / 2, 0, -depth + 0.1]}>
        <boxGeometry args={[width * 0.92, U * 0.75, 0.15]} />
        <meshStandardMaterial color="#064e3b" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* 8. Red Polarity Stripe (-12V Rail Indicator) */}
      <mesh position={[width / 2, -U * 0.28, -depth + 0.19]}>
        <boxGeometry args={[width * 0.9, 0.12, 0.04]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* 9. 16-Pin Shrouded Power Header Sockets */}
      {powerHeaders.map((x, idx) => (
        <group key={`header-${idx}`} position={[x, 0, -depth + 0.22]}>
          <mesh>
            <boxGeometry args={[0.5, 0.9, 0.3]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Shroud notch */}
          <mesh position={[0.22, 0, 0]}>
            <boxGeometry args={[0.1, 0.3, 0.31]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
        </group>
      ))}

      {/* 10. Case Specification Labels inside Chassis */}
      <Text
        position={[width / 2, U * 0.22, -depth + 0.2]}
        fontSize={0.35}
        color="#34d399"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_au.woff2"
      >
        {`${currentCase.name.toUpperCase()} • MAX DEPTH ${currentCase.maxDepthMM}mm • ${currentCase.hp}HP`}
      </Text>
    </group>
  )
}
