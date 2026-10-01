'use client'

import React, { useState, useMemo } from 'react'
import { Text, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { ModuleData } from '../lib/validation'
import { useRackStore } from '../store/useRackStore'

const SCALE = 0.1
const U = 128.5 * SCALE // 3U Eurorack height is 128.5mm

interface Module3DProps {
  module: ModuleData
  position: [number, number, number]
  isInvalid?: boolean
  onClick?: () => void
}

export function Module3D({ module, position, isInvalid, onClick }: Module3DProps) {
  const [hovered, setHover] = useState(false)
  const { selectedModule, setSelectedModule } = useRackStore()
  const isSelected = selectedModule?._id === module._id

  const width = module.hp * 5.08 * SCALE
  const depth = (module.depthMM || 25) * SCALE

  // Theme styling based on category or manufacturer
  const panelColor = useMemo(() => {
    if (isInvalid) return '#4a1215'
    if (isSelected) return '#1e2d42'
    if (hovered) return '#2a2f3a'
    
    // Palette variety
    const name = module.name.toLowerCase()
    if (name.includes('maths')) return '#181a1f' // Make Noise matte black
    if (name.includes('plaits') || name.includes('rings') || name.includes('clouds')) return '#e2e5e8' // Mutable silver
    if (name.includes('pamela')) return '#111215' // ALM black
    if (name.includes('doepfer') || name.includes('a-110')) return '#c8ccd0' // Doepfer vintage aluminum
    return '#1c1f26'
  }, [isInvalid, isSelected, hovered, module.name])

  const textColor = useMemo(() => {
    if (isInvalid) return '#ff8888'
    const name = module.name.toLowerCase()
    if (name.includes('plaits') || name.includes('rings') || name.includes('clouds') || name.includes('doepfer')) {
      return '#1a1a1a'
    }
    return '#f0f3f6'
  }, [isInvalid, module.name])

  // Procedural hardware components based on HP width
  const knobs = useMemo(() => {
    const list: Array<{ x: number; y: number; r: number; color: string }> = []
    const count = Math.max(1, Math.min(6, Math.floor(module.hp / 3)))
    const stepY = (U * 0.5) / (count + 1)
    
    for (let i = 0; i < count; i++) {
      list.push({
        x: width / 2 + (i % 2 === 0 ? -width * 0.18 : width * 0.18),
        y: U * 0.25 - (i * stepY),
        r: Math.min(width * 0.28, 0.45),
        color: i === 0 ? '#38bdf8' : '#22252c'
      })
    }
    return list
  }, [width, module.hp])

  const jacks = useMemo(() => {
    const list: Array<{ x: number; y: number }> = []
    const jackCount = Math.max(2, Math.min(8, Math.floor(module.hp / 2)))
    const cols = module.hp >= 10 ? 2 : 1
    const rows = Math.ceil(jackCount / cols)
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (list.length >= jackCount) break
        list.push({
          x: cols === 1 ? width / 2 : (c === 0 ? width * 0.3 : width * 0.7),
          y: -U * 0.22 - (r * 0.6)
        })
      }
    }
    return list
  }, [width, module.hp])

  const handleClick = (e: any) => {
    e.stopPropagation()
    setSelectedModule(module)
    if (onClick) onClick()
  }

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
    >
      {/* 1. Behind-the-panel Module Depth Enclosure / PCB */}
      <mesh position={[width / 2, 0, -depth / 2]}>
        <boxGeometry args={[width * 0.94, U * 0.94, depth]} />
        <meshStandardMaterial
          color={isInvalid ? '#5c060b' : '#14181f'}
          metalness={0.4}
          roughness={0.7}
          emissive={isInvalid ? '#800000' : '#000000'}
          emissiveIntensity={isInvalid ? 0.6 : 0}
        />
        <Edges
          scale={1}
          threshold={15}
          color={isInvalid ? '#ff3b30' : isSelected ? '#38bdf8' : '#333b47'}
        />
      </mesh>

      {/* Depth collision indicator marker at case boundary */}
      {isInvalid && (
        <mesh position={[width / 2, 0, -depth + 0.05]}>
          <planeGeometry args={[width * 0.9, U * 0.9]} />
          <meshBasicMaterial color="#ff2222" wireframe />
        </mesh>
      )}

      {/* 2. Anodized Faceplate */}
      <mesh position={[width / 2, 0, 0.4 * SCALE]}>
        <boxGeometry args={[width * 0.99, U, 0.8 * SCALE]} />
        <meshStandardMaterial
          color={panelColor}
          metalness={0.65}
          roughness={0.35}
        />
        <Edges scale={1} threshold={30} color={isSelected ? '#38bdf8' : '#475569'} />
      </mesh>

      {/* 3. Eurorack Mounting Screws (Top and Bottom) */}
      <mesh position={[width * 0.2, U * 0.46, 0.9 * SCALE]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[width * 0.8, U * 0.46, 0.9 * SCALE]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[width * 0.2, -U * 0.46, 0.9 * SCALE]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[width * 0.8, -U * 0.46, 0.9 * SCALE]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 4. Procedural Knobs */}
      {knobs.map((k, idx) => (
        <group key={`knob-${idx}`} position={[k.x, k.y, 0.9 * SCALE]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[k.r, k.r * 1.05, 0.4, 20]} />
            <meshStandardMaterial color={k.color} metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Pointer line */}
          <mesh position={[0, k.r * 0.6, 0.22]}>
            <boxGeometry args={[0.04, k.r * 0.6, 0.05]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* 5. Procedural 3.5mm Patch Jacks */}
      {jacks.map((j, idx) => (
        <group key={`jack-${idx}`} position={[j.x, j.y, 0.85 * SCALE]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.15, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.1, 0.1, 0.16, 12]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
        </group>
      ))}

      {/* 6. Module Title Label */}
      <Text
        position={[width / 2, U * 0.38, 0.9 * SCALE]}
        fontSize={Math.min(width * 0.16, 0.42)}
        color={textColor}
        anchorX="center"
        anchorY="top"
        maxWidth={width * 0.9}
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_au.woff2"
      >
        {module.name}
      </Text>

      {/* 7. HP and Depth Badge */}
      <Text
        position={[width / 2, -U * 0.39, 0.9 * SCALE]}
        fontSize={0.28}
        color={isInvalid ? '#ff4d4f' : '#64748b'}
        anchorX="center"
        anchorY="bottom"
      >
        {`${module.hp}HP • ${module.depthMM}mm`}
      </Text>
    </group>
  )
}
