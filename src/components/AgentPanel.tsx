'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRackStore } from '../store/useRackStore'
import {
  Send,
  Sparkles,
  Terminal,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Wrench,
  CheckCircle2,
  Cpu,
  RefreshCw
} from 'lucide-react'
import { AgentExecutionStep, AgentResponsePayload } from '../app/api/agent/route'
import { MCPLogEntry } from '../mcp/client'

interface Message {
  id: string
  role: 'user' | 'agent'
  text: string
  timestamp: string
  steps?: AgentExecutionStep[]
  mcpLogs?: MCPLogEntry[]
  suggestedAction?: AgentResponsePayload['suggestedAction']
  contradictionsFound?: any[]
  failingModules?: any[]
}

export function AgentPanel() {
  const { currentCase, modules, validation, setCase, addModule, clearRack, setDemoStep } = useRackStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      text: `### Welcome to Racksmith AI

I am your Eurorack technical architect backed by the **Sanity Context Model Context Protocol (MCP)** and structured Knowledge Base.

Every calculation for **HP width**, **module depth clearance**, and **power rail amperage (+12V, -12V, +5V)** is verified deterministically against official manufacturer specifications and verified bench errata.

Try asking:
- *"Build me a starter ambient rack in an Intellijel 7U 84HP case"*
- *"Is the Doepfer A-110-1 compatible with a Palette 62?"*
- *"Check for power or depth contradictions on Make Noise Maths"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [activeSteps, setActiveSteps] = useState<AgentExecutionStep[]>([])
  const [showMcpWire, setShowMcpWire] = useState(false)
  const [selectedMcpLog, setSelectedMcpLog] = useState<MCPLogEntry | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeSteps])

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim()
    if (!promptText || isLoading) return

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Initial visual execution state
    setActiveSteps([
      { id: '1', phase: 'UNDERSTANDING_REQUEST', label: 'Analyzing modular constraints & budget', status: 'running' },
      { id: '2', phase: 'CONNECTING_MCP', label: 'Querying Sanity Context MCP Knowledge Base', status: 'pending' },
      { id: '3', phase: 'DETERMINISTIC_ENGINE', label: 'Verifying electrical & physical clearance', status: 'pending' },
    ])

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          currentCase,
          modules,
          userDecisions: useRackStore.getState().userDecisions || []
        }),
      })

      if (!res.ok) {
        throw new Error(`Agent API returned ${res.status}`)
      }

      const data: AgentResponsePayload = await res.json()

      setActiveSteps(data.executionSteps || [])

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        steps: data.executionSteps,
        mcpLogs: data.mcpAuditLogs,
        suggestedAction: data.suggestedAction,
        contradictionsFound: data.contradictionsFound,
        failingModules: data.failingModules,
      }

      setMessages(prev => [...prev, agentMsg])

      // Auto-trigger build action if suggested
      if (data.suggestedAction && data.suggestedAction.type === 'BUILD_RACK') {
        const { caseId, moduleIds } = data.suggestedAction
        window.dispatchEvent(new CustomEvent('racksmith:build', { detail: { caseId, moduleIds } }))
      }
    } catch (err: any) {
      console.error('Agent chat error:', err)
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'agent',
          text: `⚠️ **Error communicating with Sanity Context Agent**: ${err.message}. Please check local MCP services.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyBuild = (action: AgentResponsePayload['suggestedAction']) => {
    if (!action || !action.caseId) return
    window.dispatchEvent(new CustomEvent('racksmith:build', { detail: { caseId: action.caseId, moduleIds: action.moduleIds || [] } }))
  }

  return (
    <div className="flex flex-col h-full bg-[#111317] border-l border-[#242832] font-sans select-text">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#242832] bg-[#161922] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 relative"></span>
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-gray-200 tracking-wider flex items-center gap-1.5">
              RACKSMITH AI <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">MCP LIVE</span>
            </h2>
            <p className="text-[10px] text-gray-400 font-mono">Sanity Context Lake: r674mqrk</p>
          </div>
        </div>

        <button
          onClick={() => setShowMcpWire(!showMcpWire)}
          title="Toggle MCP Protocol Wire Inspector"
          className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors border ${
            showMcpWire ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700' : 'bg-[#1b1f2b] text-gray-400 border-gray-700 hover:text-gray-200'
          }`}
        >
          <Terminal size={12} />
          <span>MCP Wire</span>
        </button>
      </div>

      {/* Quick Prompt Bar */}
      <div className="px-3 py-2 bg-[#141720] border-b border-[#202533] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSend('Build me a starter ambient rack in an Intellijel 7U 84HP case under $2000, prioritizing safe power and shallow depth.')}
          className="whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] bg-[#1c2230] hover:bg-[#252d40] text-blue-300 border border-blue-900/60 font-medium transition-all"
        >
          🌿 Ambient 7U Rack
        </button>
        <button
          onClick={() => handleSend('What happens if I try to install a Doepfer A-110-1 Standard VCO into an Intellijel Palette 62?')}
          className="whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] bg-[#291b1c] hover:bg-[#382325] text-rose-300 border border-rose-900/60 font-medium transition-all"
        >
          ⚠️ Test Collision (A-110)
        </button>
        <button
          onClick={() => handleSend('Check specification contradictions for Make Noise Maths power consumption.')}
          className="whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] bg-[#292419] hover:bg-[#383120] text-amber-300 border border-amber-900/60 font-medium transition-all"
        >
          ⚖️ Maths Conflict Audit
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] text-gray-500 font-mono mb-1 px-1 flex items-center gap-1.5">
              <span>{m.role === 'user' ? 'Synthesist' : 'Racksmith Agent'}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            <div
              className={`max-w-[92%] rounded-xl p-3.5 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-950/20'
                  : 'bg-[#181b24] text-gray-200 rounded-tl-none border border-[#2a2f3e] shadow-lg shadow-black/30'
              }`}
            >
              {/* Message Content formatted */}
              <div className="space-y-2 whitespace-pre-wrap font-sans">
                {m.text.split('\n\n').map((para, i) => (
                  <p key={i} className="leading-relaxed">
                    {para.startsWith('### ') ? (
                      <span className="block font-bold text-sm text-cyan-300 mt-2 mb-1">{para.replace('### ', '')}</span>
                    ) : para.startsWith('#### ') ? (
                      <span className="block font-semibold text-xs text-amber-300 mt-2 mb-1">{para.replace('#### ', '')}</span>
                    ) : (
                      para
                    )}
                  </p>
                ))}
              </div>

              {/* Execution Steps Accordion for Agent Messages */}
              {m.steps && m.steps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800/80">
                  <div className="text-[10px] font-mono text-cyan-400/90 font-semibold mb-2 flex items-center gap-1.5">
                    <Cpu size={12} className="text-cyan-400" />
                    <span>MCP EXECUTION CHAIN ({m.steps.length} VERIFICATIONS)</span>
                  </div>
                  <div className="space-y-1.5 bg-[#12141c] p-2.5 rounded-lg border border-[#222736]">
                    {m.steps.map(step => (
                      <div key={step.id} className="flex items-start gap-2 text-[11px] font-mono">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-gray-300">{step.label}</div>
                          {step.toolName && (
                            <span className="text-[10px] text-cyan-400/80 bg-cyan-950/50 px-1 py-0.2 rounded border border-cyan-900/40">
                              MCP Tool: {step.toolName}
                            </span>
                          )}
                        </div>
                        {step.durationMs !== undefined && (
                          <span className="text-[10px] text-gray-500">{step.durationMs}ms</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button: Apply proposed build */}
              {m.suggestedAction && m.suggestedAction.type === 'BUILD_RACK' && (
                <div className="mt-3 pt-2.5 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-mono">Proposed Build Ready</span>
                  <button
                    onClick={() => handleApplyBuild(m.suggestedAction)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
                  >
                    <Wrench size={13} />
                    <span>Apply Rack to 3D View</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Loading / Execution Pipeline */}
        {isLoading && (
          <div className="bg-[#181b24] border border-[#2a2f3e] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <RefreshCw size={14} className="animate-spin text-cyan-400" />
              <span>AGENT CONNECTING TO SANITY CONTEXT MCP...</span>
            </div>
            <div className="space-y-2">
              {activeSteps.map(step => (
                <div key={step.id} className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* MCP Wire Protocol Live Inspector Panel */}
      {showMcpWire && (
        <div className="h-64 border-t border-[#2a2f3e] bg-[#0d0f14] p-3 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-[11px] text-cyan-400">
            <div className="flex items-center gap-1.5">
              <Terminal size={12} />
              <span>LIVE MCP WIRE LOGS (MODEL CONTEXT PROTOCOL)</span>
            </div>
            <span className="text-[10px] text-gray-500">In-Memory Linked Transport</span>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-1.5">
            {messages.flatMap(m => m.mcpLogs || []).slice(0, 10).map((log, i) => (
              <div
                key={log.id || i}
                onClick={() => setSelectedMcpLog(log)}
                className="p-1.5 rounded bg-[#151821] hover:bg-[#1d222e] cursor-pointer border border-[#232938] flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1 rounded text-[10px] ${log.type === 'call' ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'}`}>
                    {log.type.toUpperCase()}
                  </span>
                  <span className="text-gray-300 font-semibold">{log.toolName}</span>
                </div>
                <span className="text-gray-500 text-[10px]">{log.durationMs ? `${log.durationMs}ms` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSend()
        }}
        className="p-3 bg-[#161922] border-t border-[#242832]"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Racksmith to build, validate, or audit your modular rack..."
            disabled={isLoading}
            className="w-full bg-[#0f1117] border border-[#2b3140] rounded-xl pl-4 pr-11 py-3 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 rounded-lg disabled:opacity-40 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  )
}
