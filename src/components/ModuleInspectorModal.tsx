'use client'

import React from 'react'
import { useRackStore } from '../store/useRackStore'
import { X, ExternalLink, AlertTriangle, CheckCircle, Trash2, Plus, ShieldAlert, Cpu } from 'lucide-react'

export function ModuleInspectorModal() {
  const { selectedModule, setSelectedModule, currentCase, modules, removeModule, addModule, setActiveConflictModal } = useRackStore()

  if (!selectedModule) return null

  const isInstalled = modules.some(m => m._id === selectedModule._id)
  const installedIndex = modules.findIndex(m => m._id === selectedModule._id)

  const isMaths = selectedModule._id === 'mod-maths'
  const isDoepfer = selectedModule._id === 'mod-doepfer-a110'
  const hasConflict = isMaths || isDoepfer || selectedModule._id === 'mod-rainmaker'

  const depth = selectedModule.depthMM || 25
  const maxCaseDepth = currentCase?.maxDepthMM || 45.5
  const isDepthCollision = depth > maxCaseDepth
  const clearanceMM = Number((maxCaseDepth - depth).toFixed(1))

  const handleOpenConflict = () => {
    if (isMaths) {
      setActiveConflictModal({
        entityId: 'mod-maths',
        entityName: 'Make Noise Maths',
        field: 'powerPlus12',
        explanation: 'Discrepancy in the reported +12V power consumption for Make Noise Maths. The printed manual states 60mA, but official technical bulletin and ModularGrid lab measurements verify 90mA under active LED slew cycling.',
        impactAnalysis: 'Using 90mA increases your rack +12V power rail utilization by ~24%, which may cross the recommended 80% continuous inrush headroom threshold.',
        claimA: {
          _id: 'claim-maths-60ma',
          statement: 'Maths draws 60mA on the +12V rail.',
          value: '60',
          source: 'Make Noise Maths User Manual (2022 Print)',
          sourceURL: 'https://makenoisemusic.com/manuals/mathsmanual.pdf',
          confidence: 80,
          revision: 'Rev 1.0 (2022)',
          context: 'Initial quiescent measurement with slew channels idle.'
        },
        claimB: {
          _id: 'claim-maths-90ma',
          statement: 'Revised specification is 90mA on the +12V rail under load.',
          value: '90',
          source: 'Make Noise Engineering Errata & ModularGrid Lab Bench Test',
          sourceURL: 'https://modwiggler.com/forum/viewtopic.php?t=19421',
          confidence: 95,
          revision: 'Rev 1.1 (2023)',
          context: 'Peak draw measurement with both cycle switches active and LEDs fully illuminated.'
        }
      })
    } else if (isDoepfer) {
      setActiveConflictModal({
        entityId: 'mod-doepfer-a110',
        entityName: 'Doepfer A-110-1 Standard VCO',
        field: 'depthMM',
        explanation: 'Vintage through-hole (THT) production units of the A-110-1 measure 65mm deep. Modern surface-mount (SMD) revisions released after 2018 measure 50mm deep.',
        impactAnalysis: 'Both versions exceed shallow cases like Palette 62 (45.5mm max) and Pod 40 (34mm max), but modern SMD units fit into 7U performance cases while vintage units collide with internal power supplies.',
        claimA: {
          _id: 'claim-doepfer-vintage-65mm',
          statement: 'A-110-1 depth is 65mm (Vintage THT Daughterboard).',
          value: '65',
          source: 'Doepfer Classic A-100 Manual Archive',
          sourceURL: 'https://doepfer.de/a110_man.htm',
          confidence: 90,
          revision: 'Vintage THT (pre-2018)',
          context: 'Through-hole discrete component vertical assembly.'
        },
        claimB: {
          _id: 'claim-doepfer-smd-50mm',
          statement: 'A-110-1 depth is 50mm (Modern SMD Production).',
          value: '50',
          source: 'Doepfer Factory Product Catalog (2022)',
          sourceURL: 'https://doepfer.de/a110.htm',
          confidence: 98,
          revision: 'Modern SMD (post-2018)',
          context: 'Redesigned single compact SMD PCB.'
        }
      })
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141720] border border-[#2b3345] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-[#242936] bg-[#171b26] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Cpu size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                {selectedModule.manufacturerName || 'Eurorack Module'}
              </span>
              <h2 className="text-lg font-bold text-white">{selectedModule.name}</h2>
            </div>
          </div>

          <button
            onClick={() => setSelectedModule(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Key Specs Matrix */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#0f1117] p-2.5 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Width</span>
              <span className="text-sm font-bold font-mono text-white">{selectedModule.hp} HP</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">{(selectedModule.hp * 5.08).toFixed(1)}mm</span>
            </div>

            <div className={`p-2.5 rounded-xl border text-center ${
              isDepthCollision ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-[#0f1117] border-gray-800 text-white'
            }`}>
              <span className="text-[10px] font-mono uppercase block text-gray-500">Depth</span>
              <span className="text-sm font-bold font-mono">{depth} mm</span>
              <span className={`text-[10px] block mt-0.5 ${isDepthCollision ? 'text-rose-400 font-bold' : 'text-gray-500'}`}>
                {isDepthCollision ? `+${Math.abs(clearanceMM)}mm collision` : `${clearanceMM}mm safe`}
              </span>
            </div>

            <div className="bg-[#0f1117] p-2.5 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">+12V Rail</span>
              <span className="text-sm font-bold font-mono text-cyan-300">{selectedModule.powerPlus12} mA</span>
            </div>

            <div className="bg-[#0f1117] p-2.5 rounded-xl border border-gray-800 text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">-12V Rail</span>
              <span className="text-sm font-bold font-mono text-indigo-300">{selectedModule.powerMinus12} mA</span>
            </div>
          </div>

          {/* Mechanical Depth Warning if colliding */}
          {isDepthCollision && (
            <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-200">
              <ShieldAlert size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-300 font-mono text-[11px] uppercase">
                  Physical Depth Collision with Bus Board
                </strong>
                <p className="mt-0.5 leading-relaxed">
                  The {selectedModule.name} is <strong>{depth}mm deep</strong>, exceeding the <strong>{currentCase?.name || 'Current Case'}</strong> clearance limit of <strong>{maxCaseDepth}mm</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Contradiction Alert if applicable */}
          {hasConflict && (
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3.5 flex items-center justify-between text-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                <span>Documented specification conflict exists in Sanity Knowledge Base</span>
              </div>
              <button
                onClick={handleOpenConflict}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold font-mono text-[10px] rounded-md transition-colors"
              >
                Inspect Conflict
              </button>
            </div>
          )}

          {/* Source Provenance */}
          <div className="bg-[#11131a] p-3 rounded-xl border border-[#232938] space-y-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
              Verified Source Provenance
            </span>
            <div className="flex items-center justify-between text-gray-300">
              <span>Revision / Specification Sheet:</span>
              <span className="font-mono text-cyan-300">{selectedModule.revision || 'Official Manual'}</span>
            </div>
            {selectedModule.sourceURL && (
              <a
                href={selectedModule.sourceURL}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 mt-1 text-[11px]"
              >
                <span>Open Manufacturer Documentation</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#11131a] border-t border-[#232938] flex items-center justify-between">
          <button
            onClick={() => setSelectedModule(null)}
            className="text-gray-400 hover:text-gray-200 text-xs"
          >
            Close
          </button>

          {isInstalled ? (
            <button
              onClick={() => {
                if (installedIndex !== -1) removeModule(installedIndex)
                setSelectedModule(null)
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} />
              <span>Remove from Rack</span>
            </button>
          ) : (
            <button
              onClick={() => {
                addModule(selectedModule)
                setSelectedModule(null)
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={13} />
              <span>Add to 3D Rack</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
