'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRackStore } from '../store/useRackStore'
import { Case3D } from './Case3D'
import { Module3D } from './Module3D'

export function Rack3D() {
  const { currentCase, modules, validation } = useRackStore()
  
  if (!currentCase) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0b0f] text-gray-400 font-mono text-sm">
        <p>No case selected. Choose a case from the top dropdown or ask the AI.</p>
      </div>
    )
  }

  // Calculate positions from left to right based on HP
  let currentX = 0
  const moduleComponents = modules.map((m, i) => {
    const isInvalidDepth = (m.depthMM || 0) > currentCase.maxDepthMM
    const comp = (
      <Module3D
        key={`${m._id}-${i}`}
        module={m}
        position={[currentX, 0, 0]}
        isInvalid={isInvalidDepth}
      />
    )
    currentX += m.hp * 5.08 * 0.1
    return comp
  })

  // Center the case at origin [0, 0, 0]
  const caseWidth = currentCase.hp * 5.08 * 0.1
  const cameraZ = Math.max(46, caseWidth * 1.25)

  return (
    <div className="w-full h-full min-h-[400px] relative bg-[#090b10]">
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 42 }}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#0a0b10']} />
        
        {/* Self-contained studio illumination (no external HDR dependency) */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[12, 18, 15]} intensity={1.4} castShadow />
        <directionalLight position={[-12, 12, 10]} intensity={0.7} color="#93c5fd" />
        <directionalLight position={[0, -10, 8]} intensity={0.3} color="#fcd34d" />
        <pointLight position={[0, 0, 20]} intensity={0.6} />

        {/* 3D Hardware Geometry */}
        <group position={[-caseWidth / 2, 0, 0]}>
          <Case3D currentCase={currentCase} />
          {moduleComponents}
        </group>
        
        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          minDistance={10}
          maxDistance={90}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.4}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  )
}
