'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Rack3D } from './Rack3D'
import { AgentPanel } from './AgentPanel'
import { ContradictionModal } from './ContradictionModal'
import { ModuleInspectorModal } from './ModuleInspectorModal'
import { ExportSummaryModal } from './ExportSummaryModal'
import { useRackStore } from '../store/useRackStore'
import {
  AlertCircle,
  FileText,
  Info,
  GripVertical,
  Plus,
  Trash2,
  Search,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Box,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { client } from '../sanity/client'
import { CaseData, ModuleData } from '../lib/validation'
import { SEED_CASES, SEED_MODULES } from '../sanity/seed-data'

export function MainApp() {
  const {
    currentCase,
    modules,
    validation,
    userDecisions,
    setCase,
    addModule,
    removeModule,
    clearRack,
    setSelectedModule,
    setActiveConflictModal,
    demoStep,
    setDemoStep,
    applyUserDecision
  } = useRackStore()

  const [evidencePanelOpen, setEvidencePanelOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [availableModules, setAvailableModules] = useState<ModuleData[]>([])
  const [availableCases, setAvailableCases] = useState<CaseData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Load modules and cases from Sanity
  useEffect(() => {
    async function loadData() {
      try {
        const [modData, caseData] = await Promise.all([
          client.fetch(`*[_type == "module"]{
            _id, name, hp, depthMM, powerPlus12, powerMinus12, power5V, sourceURL, revision, category, description,
            "manufacturerName": manufacturer->name
          }`),
          client.fetch(`*[_type == "case"]{
            _id, name, hp, maxDepthMM, powerCapacityPlus12, powerCapacityMinus12, powerCapacity5V, busBoardType, sourceURL, revision,
            "manufacturerName": manufacturer->name
          }`)
        ])

        if (Array.isArray(modData) && modData.length > 0) {
          setAvailableModules(modData)
        } else {
          setAvailableModules(SEED_MODULES as any)
        }

        if (Array.isArray(caseData) && caseData.length > 0) {
          setAvailableCases(caseData)
          if (!useRackStore.getState().currentCase) {
            setCase(caseData[0])
          }
        } else {
          setAvailableCases(SEED_CASES as any)
          if (!useRackStore.getState().currentCase) {
            setCase(SEED_CASES[0] as any)
          }
        }
      } catch (err) {
        console.warn('Sanity query error, using fallback seed dataset:', err)
        setAvailableModules(SEED_MODULES as any)
        setAvailableCases(SEED_CASES as any)
        if (!useRackStore.getState().currentCase) {
          setCase(SEED_CASES[0] as any)
        }
      }
    }

    loadData()
  }, [setCase])

  // Custom build listener from AgentPanel
  useEffect(() => {
    const handleBuildRack = async (e: any) => {
      const { caseId, moduleIds } = e.detail
      let targetCase = availableCases.find(c => c._id === caseId || c.name.toLowerCase().includes(caseId.toLowerCase()))
      if (!targetCase) {
        targetCase = await client.fetch(`*[_id == $caseId || name match $caseId][0]`, { caseId })
      }
      if (targetCase) setCase(targetCase)

      const resolvedMods = (moduleIds || []).map((id: string) => {
        const query = (id || '').toLowerCase().trim()
        return availableModules.find(m => 
          m._id === id || 
          m._id.toLowerCase() === query || 
          m.name.toLowerCase() === query || 
          m.name.toLowerCase().includes(query) ||
          query.includes(m.name.toLowerCase()) ||
          query.includes(m._id.toLowerCase())
        )
      }).filter(Boolean)

      clearRack()
      setTimeout(() => {
        if (targetCase) setCase(targetCase)
        resolvedMods.forEach((m: any) => addModule(m))
      }, 50)
    }

    window.addEventListener('racksmith:build', handleBuildRack)
    return () => window.removeEventListener('racksmith:build', handleBuildRack)
  }, [availableCases, availableModules, setCase, addModule, clearRack])

  // Filter modules
  const filteredModules = useMemo(() => {
    return availableModules.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.manufacturerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [availableModules, searchQuery, selectedCategory])

  const handleDragStart = (e: React.DragEvent, module: ModuleData) => {
    e.dataTransfer.setData('application/json', JSON.stringify(module))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!currentCase) return
    try {
      const data = e.dataTransfer.getData('application/json')
      if (data) {
        const module = JSON.parse(data)
        addModule(module)
      }
    } catch {}
  }

  // --- AUTOMATED DEMO MODE WORKFLOW (Section 45) ---
  const runDemoStep = async (step: number) => {
    setDemoStep(step)
    if (step === 1) {
      // Step 1: Ambient starter build in 7U 84HP
      const case7u = availableCases.find(c => c._id === 'case-7u-84') || availableCases[1] || availableCases[0]
      setCase(case7u)
      clearRack()
      const mods = ['mod-plaits', 'mod-rings', 'mod-maths', 'mod-clouds', 'mod-pamela-pro']
      setTimeout(() => {
        mods.forEach(id => {
          const m = availableModules.find(mod => mod._id === id)
          if (m) addModule(m)
        })
      }, 100)
    } else if (step === 2) {
      // Step 2: WOW Collision Moment — shallow Palette 62 + deep Doepfer A-110-1
      const palette = availableCases.find(c => c._id === 'case-palette-62') || availableCases[0]
      setCase(palette)
      clearRack()
      const plaits = availableModules.find(m => m._id === 'mod-plaits')
      const doepfer = availableModules.find(m => m._id === 'mod-doepfer-a110')
      if (plaits) addModule(plaits)
      if (doepfer) addModule(doepfer) // 55mm deep into 45.5mm case -> COLLISION!
    } else if (step === 3) {
      // Step 3: Trigger Contradiction Modal for Maths
      setActiveConflictModal({
        entityId: 'mod-maths',
        entityName: 'Make Noise Maths',
        field: 'powerPlus12',
        explanation: 'Discrepancy in the reported +12V power consumption for Make Noise Maths. The printed manual states 60mA, but official technical bulletin and ModularGrid lab measurements verify 90mA under active LED slew cycling.',
        impactAnalysis: 'Using 90mA increases +12V rail utilization by ~24%, which may cross the recommended 80% continuous inrush headroom threshold.',
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
    } else if (step === 4) {
      // Step 4: Resolve with 90mA errata decision
      applyUserDecision({
        _id: `decision-maths-90ma`,
        _type: 'userDecision',
        entityId: 'mod-maths',
        field: 'powerPlus12',
        chosenValue: '90',
        chosenClaimId: 'claim-maths-90ma',
        rationale: 'Applied verified 2023 lab errata revision',
        context: 'Racksmith Golden Demo',
        timestamp: new Date().toISOString(),
        active: true
      })
    } else if (step === 5) {
      // Step 5: Export Summary
      setExportModalOpen(true)
    }
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#0d0f14] text-white font-sans select-none">
      
      {/* Top Navigation & Demo Golden Path Bar */}
      <header className="h-14 bg-[#141722] border-b border-[#232938] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-950/40">
              <Box size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                RACKSMITH
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-normal">
                  v2.0 HACKATHON
                </span>
              </h1>
              <p className="text-[10px] text-gray-400 font-mono">Sanity Context MCP • Structured Eurorack Intelligence</p>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-800 hidden md:block"></div>

          {/* Golden Path Demo Steps */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#0f1118] px-2 py-1 rounded-xl border border-[#212635]">
            <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 flex items-center gap-1">
              <Play size={10} className="fill-cyan-400" /> DEMO FLOW:
            </span>
            <button
              onClick={() => runDemoStep(1)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                demoStep === 1 ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              1. Ambient 7U
            </button>
            <button
              onClick={() => runDemoStep(2)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                demoStep === 2 ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              2. Depth Collision
            </button>
            <button
              onClick={() => runDemoStep(3)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                demoStep === 3 ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              3. Spec Conflict
            </button>
            <button
              onClick={() => runDemoStep(4)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                demoStep === 4 ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              4. Resolve Errata
            </button>
            <button
              onClick={() => runDemoStep(5)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                demoStep === 5 ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              5. Export BOM
            </button>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Case Selector Dropdown */}
          <div className="flex items-center gap-2 bg-[#0f1118] px-3 py-1.5 rounded-xl border border-[#212635]">
            <span className="text-[11px] font-mono text-gray-400 uppercase">Case:</span>
            <select
              value={currentCase?._id || ''}
              onChange={(e) => {
                const c = availableCases.find(x => x._id === e.target.value)
                if (c) setCase(c)
              }}
              className="bg-transparent text-xs font-semibold text-cyan-300 focus:outline-none cursor-pointer"
            >
              {availableCases.map(c => (
                <option key={c._id} value={c._id} className="bg-[#141722] text-gray-200">
                  {c.name} ({c.hp}HP, max {c.maxDepthMM}mm)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#1b202c] hover:bg-[#252c3d] text-gray-200 text-xs font-medium border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            <Printer size={13} />
            <span>Export</span>
          </button>

          <button
            onClick={() => clearRack()}
            title="Clear all modules from rack"
            className="p-2 rounded-xl bg-[#1b202c] hover:bg-rose-950/50 hover:text-rose-400 text-gray-400 border border-gray-700 transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Module Library Browser Sidebar */}
        <aside className="w-72 bg-[#12141c] border-r border-[#202533] flex flex-col z-10 shrink-0">
          <div className="p-3.5 border-b border-[#202533] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-gray-300 tracking-wider">
                Module Catalog ({filteredModules.length})
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Drag or click</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules, chips, makers..."
                className="w-full bg-[#0a0c10] border border-[#232938] rounded-lg pl-8 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
              {['all', 'oscillator', 'filter', 'modulator', 'effect', 'utility'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-[#181c26] text-gray-400 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Module Cards Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredModules.map(m => {
              const isFailing = currentCase && (m.depthMM || 0) > currentCase.maxDepthMM
              return (
                <div
                  key={m._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, m)}
                  onClick={() => setSelectedModule(m)}
                  className={`group p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                    isFailing
                      ? 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/30'
                      : 'bg-[#161922] border-[#222736] hover:bg-[#1c202c] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block">
                        {m.manufacturerName || 'Eurorack'}
                      </span>
                      <h3 className="text-xs font-bold text-gray-100 group-hover:text-cyan-300 transition-colors">
                        {m.name}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addModule(m)
                      }}
                      title="Add to rack"
                      className="p-1 rounded-md bg-[#222838] hover:bg-blue-600 text-gray-400 hover:text-white transition-colors opacity-80 group-hover:opacity-100"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-400">{m.hp}HP</span>
                    <span className={isFailing ? 'text-rose-400 font-bold' : 'text-gray-400'}>
                      {m.depthMM}mm {isFailing ? '⚠️' : ''}
                    </span>
                    <span className="text-cyan-400/80">+{m.powerPlus12}mA</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Installed Modules Summary Tray */}
          <div className="p-3 bg-[#0f1118] border-t border-[#202533] max-h-48 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">
                Installed in Rack ({modules.length})
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {validation?.hp.used || 0} / {currentCase?.hp || 0} HP
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {modules.map((m, idx) => (
                <div
                  key={`${m._id}-${idx}`}
                  onClick={() => setSelectedModule(m)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#161922] border border-[#212635] flex items-center justify-between text-xs hover:border-gray-600 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-gray-500 font-mono text-[10px]">{m.hp}HP</span>
                    <span className="truncate text-gray-200">{m.name}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeModule(idx)
                    }}
                    className="text-gray-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {modules.length === 0 && (
                <div className="text-[11px] text-gray-500 text-center py-4">
                  Drag modules into rack or ask AI to assemble.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER: 3D Eurorack Visualization & HUD */}
        <main
          className="flex-1 relative flex flex-col bg-[#0a0b0f]"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* 3D Canvas */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Rack3D />
          </div>

          {/* FLOATING TOP-LEFT: Power & Clearance Technical HUD */}
          <div className="absolute top-4 left-4 pointer-events-none z-10 max-w-sm w-full">
            <div className="bg-[#12151e]/90 backdrop-blur-md border border-[#252b3b] p-4 rounded-2xl shadow-2xl pointer-events-auto space-y-3 font-sans">
              
              {/* Header Status */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    validation?.status === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    validation?.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {validation?.status === 'PASS' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Rack Verification</span>
                    <strong className={`font-mono text-sm ${
                      validation?.status === 'PASS' ? 'text-emerald-400' :
                      validation?.status === 'WARNING' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {validation?.status || 'NO RACK'}
                    </strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Available HP</span>
                  <span className={`font-mono text-sm font-bold ${
                    validation?.hp.status === 'FAIL' ? 'text-rose-400' : 'text-gray-200'
                  }`}>
                    {validation?.hp.remaining || 0} HP
                  </span>
                </div>
              </div>

              {/* Power Rail Heatmap Gauges */}
              {validation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span className="flex items-center gap-1"><Zap size={11} className="text-amber-400" /> Power Rails</span>
                    <span className="text-[10px] text-gray-500">80% inrush limit</span>
                  </div>

                  {/* +12V Rail */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-gray-400">+12V Rail</span>
                      <span className={validation.power.plus12.status === 'FAIL' ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                        {validation.power.plus12.used}mA / {validation.power.plus12.total}mA ({validation.power.plus12.percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1b202c] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          validation.power.plus12.status === 'FAIL' ? 'bg-rose-500' :
                          validation.power.plus12.status === 'WARNING' ? 'bg-amber-400' :
                          'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.min(100, validation.power.plus12.percent)}%` }}
                      />
                    </div>
                  </div>

                  {/* -12V Rail */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-gray-400">-12V Rail</span>
                      <span className={validation.power.minus12.status === 'FAIL' ? 'text-rose-400 font-bold' : 'text-indigo-300'}>
                        {validation.power.minus12.used}mA / {validation.power.minus12.total}mA ({validation.power.minus12.percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1b202c] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          validation.power.minus12.status === 'FAIL' ? 'bg-rose-500' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${Math.min(100, validation.power.minus12.percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Depth Collision Alert Banner */}
              {validation?.depth.status === 'FAIL' && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs space-y-1 animate-pulse">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-rose-300">
                    <AlertCircle size={14} className="text-rose-400 shrink-0" />
                    <span>PHYSICAL DEPTH COLLISION!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Case clearance limit is <strong>{validation.depth.caseMaxDepth}mm</strong>.
                    {' '}{validation.depth.failingModules.map(f => f.module.name).join(', ')} require up to <strong>{validation.depth.maxModuleDepth}mm</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING TOP-RIGHT: Evidence & Provenance Drawer Toggle */}
          <div className="absolute top-4 right-4 z-10 pointer-events-auto">
            <button
              onClick={() => setEvidencePanelOpen(!evidencePanelOpen)}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-xl flex items-center gap-2 text-xs font-mono ${
                evidencePanelOpen
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : 'bg-[#12151e]/90 text-gray-300 border-[#262c3d] hover:text-white hover:bg-[#1a1f2b]'
              }`}
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Evidence & Citations</span>
            </button>
          </div>

          {/* EVIDENCE & PROVENANCE DRAWER */}
          {evidencePanelOpen && (
            <div className="absolute right-4 top-16 bottom-4 w-84 bg-[#12151e]/95 backdrop-blur-md border border-[#262c3d] rounded-2xl shadow-2xl p-4 overflow-y-auto pointer-events-auto z-20 flex flex-col font-sans text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h3 className="font-bold text-gray-200 flex items-center gap-2 text-xs">
                  <Info size={15} className="text-cyan-400" />
                  <span>KNOWLEDGE BASE PROVENANCE</span>
                </h3>
                <button onClick={() => setEvidencePanelOpen(false)} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-4">
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Every technical specification is connected directly to official manufacturer user manuals, physical lab bench audits, and errata stored in Sanity project <code className="text-cyan-300">r674mqrk</code>.
                </p>

                {/* Active Contradiction Audits */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                    Documented Errata & Conflicts
                  </span>

                  <div
                    onClick={() => runDemoStep(3)}
                    className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 hover:bg-amber-950/30 cursor-pointer transition-colors space-y-1"
                  >
                    <span className="text-amber-300 font-bold block text-xs">Make Noise Maths (+12V Rail)</span>
                    <p className="text-[10px] text-gray-400">Manual states 60mA vs Bench test 90mA under active slew load.</p>
                    <span className="text-[10px] text-cyan-400 underline block mt-1">Inspect conflict modal →</span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveConflictModal({
                        entityId: 'mod-rainmaker',
                        entityName: 'Intellijel Rainmaker',
                        field: 'depthMM',
                        explanation: 'Intellijel official manual lists module depth as 42mm. However, when the standard 16-pin Eurorack power ribbon cable is seated in the rear shroud, the required mechanical clearance is 46mm.',
                        impactAnalysis: 'The Intellijel Palette 62 provides exactly 45.5mm depth. At 42mm the module fits; at 46mm the cable connector presses directly against the case bus board.',
                        claimA: {
                          _id: 'claim-rainmaker-42mm',
                          statement: 'Rainmaker depth is 42mm (bare PCB).',
                          value: '42',
                          source: 'Intellijel Official Specifications Sheet (2021)',
                          confidence: 85,
                          revision: 'Manual Spec 2021',
                        },
                        claimB: {
                          _id: 'claim-rainmaker-46mm',
                          statement: 'Rainmaker requires 46mm clearance with standard IDC ribbon cable.',
                          value: '46',
                          source: 'Muff Wiggler / ModWiggler Hardware Audit 2023',
                          confidence: 95,
                          revision: 'Hardware Clearance Audit',
                        }
                      })
                    }}
                    className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 hover:bg-amber-950/30 cursor-pointer transition-colors space-y-1"
                  >
                    <span className="text-amber-300 font-bold block text-xs">Intellijel Rainmaker (Depth)</span>
                    <p className="text-[10px] text-gray-400">Bare PCB 42mm vs 46mm with standard IDC power ribbon seated.</p>
                    <span className="text-[10px] text-cyan-400 underline block mt-1">Inspect conflict modal →</span>
                  </div>
                </div>

                {/* Stored User Decisions */}
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                    Active User Decisions ({userDecisions.length})
                  </span>
                  {userDecisions.map(d => (
                    <div key={d._id} className="p-2.5 rounded-lg bg-[#0e1118] border border-gray-800 text-[11px]">
                      <div className="text-white font-medium">{d.entityId} • {d.field}</div>
                      <div className="text-emerald-400 font-mono text-[10px] mt-0.5">Value: {d.chosenValue}</div>
                      <div className="text-gray-500 text-[10px] italic">{d.rationale}</div>
                    </div>
                  ))}
                  {userDecisions.length === 0 && (
                    <span className="text-gray-500 text-[11px] block">No conflicting decisions made yet.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: AI Agent & MCP Execution Pipeline Panel */}
        <aside className="w-96 shrink-0 h-full border-l border-[#202533] z-10 flex flex-col">
          <AgentPanel />
        </aside>
      </div>

      {/* Modals */}
      <ContradictionModal />
      <ModuleInspectorModal />
      <ExportSummaryModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </div>
  )
}
