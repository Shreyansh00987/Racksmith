'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useRackStore } from '../store/useRackStore'
import { Case3D } from './Case3D'
import { Module3D } from './Module3D'

export function Rack3D() {
  const { currentCase, modules, validation } = useRackStore()
  
  if (!currentCase) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
        <p>No case selected. Ask the agent to build a rack.</p>
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

  // Center the camera on the case
  const caseWidth = currentCase.hp * 5.08 * 0.1

  return (
    <div className="w-full h-full bg-gray-950">
      <Canvas camera={{ position: [caseWidth / 2, 0, 40], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, 5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <group position={[-caseWidth / 2, 0, 0]}>
            <Case3D currentCase={currentCase} />
            {moduleComponents}
          </group>
          <Environment preset="studio" />
        </Suspense>
        
        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
}
