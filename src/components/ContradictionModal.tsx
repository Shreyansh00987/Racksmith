'use client'

import React from 'react'
import { useRackStore } from '../store/useRackStore'
import { AlertTriangle, CheckCircle, ExternalLink, ShieldCheck, X } from 'lucide-react'
import { KnowledgeBase } from '../sanity/knowledge'

export function ContradictionModal() {
  const { activeConflictModal, setActiveConflictModal, applyUserDecision } = useRackStore()

  if (!activeConflictModal) return null

  const {
    entityId = 'mod-maths',
    entityName = 'Make Noise Maths',
    field = 'powerPlus12',
    explanation = 'Discrepancy in the reported +12V power consumption for Make Noise Maths. The printed manual states 60mA, but official technical bulletin and ModularGrid lab measurements verify 90mA under active LED slew cycling.',
    impactAnalysis = 'Using 90mA increases your rack +12V power rail utilization by ~24%, which may cross the recommended 80% continuous inrush headroom threshold.',
    claimA = {
      _id: 'claim-maths-60ma',
      statement: 'Maths draws 60mA on the +12V rail.',
      value: '60',
      source: 'Make Noise Maths User Manual (2022 Print)',
      sourceURL: 'https://makenoisemusic.com/manuals/mathsmanual.pdf',
      confidence: 80,
      revision: 'Rev 1.0 (2022)',
      context: 'Initial quiescent measurement with slew channels idle.'
    },
    claimB = {
      _id: 'claim-maths-90ma',
      statement: 'Revised specification is 90mA on the +12V rail under load.',
      value: '90',
      source: 'Make Noise Engineering Errata & ModularGrid Lab Bench Test',
      sourceURL: 'https://modwiggler.com/forum/viewtopic.php?t=19421',
      confidence: 95,
      revision: 'Rev 1.1 (2023)',
      context: 'Peak draw measurement with both cycle switches active and LEDs fully illuminated.'
    }
  } = activeConflictModal

  const handleChoose = async (chosenClaim: typeof claimA, value: string, rationale: string) => {
    const saved = await KnowledgeBase.saveUserDecision({
      entityId,
      field,
      chosenValue: value,
      chosenClaimId: chosenClaim._id,
      rationale,
      context: 'Racksmith Hackathon Build',
    })

    applyUserDecision(saved)
    setActiveConflictModal(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141720] border border-[#2b3345] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/60 to-rose-950/60 border-b border-amber-900/40 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle size={22} />
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-wider font-bold text-amber-400 uppercase">
                Sanity Knowledge Base Conflict
              </span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Specification Contradiction: <span className="text-amber-200">{entityName}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={() => setActiveConflictModal(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Explanation */}
          <div className="bg-[#0f1118] p-3.5 rounded-xl border border-gray-800 text-xs text-gray-300 leading-relaxed">
            <strong className="text-cyan-400 block mb-1 font-mono uppercase text-[10px]">What is the conflict?</strong>
            {explanation}
          </div>

          {/* Claims Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Claim A */}
            <div className="bg-[#181c26] border border-[#2c3345] rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
                  <span>SOURCE A</span>
                  <span className="text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    {claimA.revision}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mb-1">
                  {claimA.value}{field.toLowerCase().includes('depth') ? 'mm' : 'mA'}
                </div>
                <p className="text-xs text-gray-300 font-medium">{claimA.statement}</p>
                <div className="mt-2 text-[11px] text-gray-400 space-y-1">
                  <p className="truncate"><strong className="text-gray-500">Source:</strong> {claimA.source}</p>
                  <p><strong className="text-gray-500">Confidence:</strong> {claimA.confidence}%</p>
                  <p className="italic text-[10px] text-gray-400">{claimA.context}</p>
                </div>
              </div>

              <button
                onClick={() => handleChoose(claimA, claimA.value, `Selected baseline: ${claimA.source}`)}
                className="w-full mt-3 py-2 bg-[#212634] hover:bg-[#2c3346] text-gray-200 hover:text-white text-xs font-semibold rounded-lg border border-gray-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Use {claimA.value}{field.toLowerCase().includes('depth') ? 'mm' : 'mA'} (Source A)</span>
              </button>
            </div>

            {/* Claim B */}
            <div className="bg-[#1a1e2b] border border-cyan-900/60 rounded-xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl">
                VERIFIED ERRATA
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
                  <span>SOURCE B</span>
                  <span className="text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    {claimB.revision}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-300 mb-1">
                  {claimB.value}{field.toLowerCase().includes('depth') ? 'mm' : 'mA'}
                </div>
                <p className="text-xs text-gray-300 font-medium">{claimB.statement}</p>
                <div className="mt-2 text-[11px] text-gray-400 space-y-1">
                  <p className="truncate"><strong className="text-gray-500">Source:</strong> {claimB.source}</p>
                  <p><strong className="text-gray-500">Confidence:</strong> {claimB.confidence}%</p>
                  <p className="italic text-[10px] text-gray-400">{claimB.context}</p>
                </div>
              </div>

              <button
                onClick={() => handleChoose(claimB, claimB.value, `Selected verified errata: ${claimB.source}`)}
                className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg border border-emerald-500 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
              >
                <CheckCircle size={13} />
                <span>Use {claimB.value}{field.toLowerCase().includes('depth') ? 'mm' : 'mA'} (Recommended)</span>
              </button>
            </div>
          </div>

          {/* Why It Matters */}
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block font-mono text-[10px] uppercase">Why This Decision Matters</strong>
              {impactAnalysis}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#10131a] px-6 py-3 border-t border-[#232836] flex justify-between items-center text-[11px] text-gray-400 font-mono">
          <span>Decisions persist to Sanity dataset 'production'</span>
          <button
            onClick={() => setActiveConflictModal(null)}
            className="text-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
