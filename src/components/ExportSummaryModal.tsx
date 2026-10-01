'use client'

import React, { useState } from 'react'
import { useRackStore } from '../store/useRackStore'
import { X, Printer, Download, Copy, Check, FileSpreadsheet } from 'lucide-react'

interface ExportSummaryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportSummaryModal({ isOpen, onClose }: ExportSummaryModalProps) {
  const { currentCase, modules, validation, userDecisions } = useRackStore()
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const totalCostEstimate = modules.length * 280 // Typical avg modular price

  const exportData = {
    appName: 'Racksmith Modular Synthesizer Planner',
    generatedAt: new Date().toISOString(),
    case: currentCase,
    modules: modules.map(m => ({
      name: m.name,
      hp: m.hp,
      depthMM: m.depthMM,
      powerPlus12: m.powerPlus12,
      powerMinus12: m.powerMinus12,
      power5V: m.power5V,
      sourceURL: m.sourceURL,
      revision: m.revision
    })),
    validation,
    userDecisions,
  }

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadCSV = () => {
    const headers = ['Module Name', 'HP', 'Depth (mm)', '+12V (mA)', '-12V (mA)', '+5V (mA)', 'Source URL', 'Revision']
    const rows = modules.map(m => [
      `"${m.name}"`,
      m.hp,
      m.depthMM,
      m.powerPlus12,
      m.powerMinus12,
      m.power5V,
      `"${m.sourceURL || ''}"`,
      `"${m.revision || ''}"`
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `racksmith-build-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141720] border border-[#2b3345] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-sans text-gray-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-[#242936] bg-[#171b26] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
              Racksmith Specification Export
            </span>
            <h2 className="text-lg font-bold text-white">System Build Summary & Provenance BOM</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Chassis & Validation Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0f1118] p-3 rounded-xl border border-gray-800">
              <span className="text-gray-500 uppercase text-[10px] font-mono block">Chassis Case</span>
              <span className="text-sm font-bold text-white block mt-0.5">{currentCase?.name || 'No Case'}</span>
              <span className="text-gray-400 text-[11px]">{currentCase?.hp}HP • Max {currentCase?.maxDepthMM}mm</span>
            </div>

            <div className="bg-[#0f1118] p-3 rounded-xl border border-gray-800">
              <span className="text-gray-500 uppercase text-[10px] font-mono block">HP Occupancy</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {validation?.hp.used || 0} / {validation?.hp.total || 0} HP
              </span>
              <span className="text-gray-400 text-[11px]">{validation?.hp.remaining || 0} HP remaining</span>
            </div>

            <div className={`p-3 rounded-xl border ${
              validation?.status === 'PASS' ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' :
              validation?.status === 'WARNING' ? 'bg-amber-950/20 border-amber-800 text-amber-300' :
              'bg-rose-950/20 border-rose-800 text-rose-300'
            }`}>
              <span className="uppercase text-[10px] font-mono block text-gray-500">Validation Status</span>
              <span className="text-sm font-bold font-mono block mt-0.5">{validation?.status || 'UNKNOWN'}</span>
              <span className="text-[11px] block">{validation?.depth.status === 'FAIL' ? 'Depth Collision' : 'Mechanically Valid'}</span>
            </div>
          </div>

          {/* Electrical Rail Amperage Table */}
          <div className="bg-[#0f1118] p-4 rounded-xl border border-gray-800 space-y-2">
            <h3 className="font-mono text-[11px] font-bold text-gray-300 uppercase">Power Rails & Inrush Headroom</h3>
            <div className="grid grid-cols-3 gap-4 text-center pt-1">
              <div>
                <span className="text-gray-500 font-mono text-[10px] block">+12V Rail</span>
                <span className="text-sm font-bold font-mono text-cyan-300">
                  {validation?.power.plus12.used}mA / {validation?.power.plus12.total}mA
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">({validation?.power.plus12.percent}%)</span>
              </div>
              <div>
                <span className="text-gray-500 font-mono text-[10px] block">-12V Rail</span>
                <span className="text-sm font-bold font-mono text-indigo-300">
                  {validation?.power.minus12.used}mA / {validation?.power.minus12.total}mA
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">({validation?.power.minus12.percent}%)</span>
              </div>
              <div>
                <span className="text-gray-500 font-mono text-[10px] block">+5V Rail</span>
                <span className="text-sm font-bold font-mono text-amber-300">
                  {validation?.power.plus5v.used}mA / {validation?.power.plus5v.total}mA
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">({validation?.power.plus5v.percent}%)</span>
              </div>
            </div>
          </div>

          {/* Installed Modules Bill of Materials */}
          <div className="space-y-2">
            <h3 className="font-mono text-[11px] font-bold text-gray-300 uppercase">Installed Modules ({modules.length})</h3>
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181c26] text-gray-400 font-mono text-[10px] uppercase border-b border-gray-800">
                  <tr>
                    <th className="p-2.5">Module</th>
                    <th className="p-2.5 text-center">Width</th>
                    <th className="p-2.5 text-center">Depth</th>
                    <th className="p-2.5 text-right">+12V</th>
                    <th className="p-2.5 text-right">-12V</th>
                    <th className="p-2.5">Specification Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
                  {modules.map((m, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30">
                      <td className="p-2.5 font-sans font-medium text-white">{m.name}</td>
                      <td className="p-2.5 text-center">{m.hp}HP</td>
                      <td className="p-2.5 text-center">{m.depthMM}mm</td>
                      <td className="p-2.5 text-right text-cyan-300">{m.powerPlus12}mA</td>
                      <td className="p-2.5 text-right text-indigo-300">{m.powerMinus12}mA</td>
                      <td className="p-2.5 font-sans text-gray-400 text-[10px] truncate max-w-xs">{m.revision || 'Manufacturer Manual'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Decisions Applied */}
          {userDecisions.length > 0 && (
            <div className="bg-[#0f1118] p-3 rounded-xl border border-gray-800 space-y-1.5">
              <h3 className="font-mono text-[10px] font-bold text-amber-400 uppercase">User Decisions & Errata Applied</h3>
              {userDecisions.map((d, idx) => (
                <div key={idx} className="text-gray-300 text-[11px]">
                  • <strong>{d.entityId}</strong>: Chose <strong>{d.chosenValue}</strong> ({d.rationale})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#11131a] border-t border-[#232938] flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleCopyJSON}
              className="px-3 py-1.5 bg-[#1b202c] hover:bg-[#262c3d] text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 bg-[#1b202c] hover:bg-[#262c3d] text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition-colors"
            >
              <FileSpreadsheet size={13} />
              <span>Download CSV</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-950"
          >
            <Printer size={13} />
            <span>Print Specification Sheet</span>
          </button>
        </div>
      </div>
    </div>
  )
}
