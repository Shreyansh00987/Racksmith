import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { validateRack, ModuleData, CaseData } from '../src/lib/validation'
import { executeMCPTool, getSanityMCPClient } from '../src/mcp/client'
import { KnowledgeBase, UserDecisionDoc } from '../src/sanity/knowledge'

interface TestReport {
  suite: string
  name: string
  passed: boolean
  error?: string
  durationMs: number
}

const reports: TestReport[] = []

async function runTest(suite: string, name: string, fn: () => Promise<void> | void) {
  const start = Date.now()
  try {
    await fn()
    reports.push({
      suite,
      name,
      passed: true,
      durationMs: Date.now() - start
    })
    console.log(`  ✓ [${suite}] ${name} (${Date.now() - start}ms)`)
  } catch (err: any) {
    reports.push({
      suite,
      name,
      passed: false,
      error: err.message,
      durationMs: Date.now() - start
    })
    console.error(`  ✗ [${suite}] ${name}: ${err.message}`)
  }
}

async function runAllTests() {
  console.log(`\n======================================================`)
  console.log(`🧪 RACKSMITH COMPREHENSIVE AUTOMATED TEST SUITE`)
  console.log(`Testing Deterministic Engines, Sanity MCP, & Contradictions`)
  console.log(`======================================================\n`)

  const testCase: CaseData = {
    _id: 'case-test-palette-62',
    name: 'Intellijel Palette 62',
    hp: 62,
    maxDepthMM: 45.5,
    powerCapacityPlus12: 1200,
    powerCapacityMinus12: 1200,
    powerCapacity5V: 500
  }

  // --- 1. HP VALIDATION TESTS ---
  console.log(`▶ 1. HP WIDTH VALIDATION SUITE`)
  await runTest('HP', 'Should PASS when modules fit within case HP', () => {
    const modules: ModuleData[] = [
      { _id: 'm1', name: 'Module A', hp: 20, depthMM: 25, powerPlus12: 50, powerMinus12: 10, power5V: 0 },
      { _id: 'm2', name: 'Module B', hp: 40, depthMM: 25, powerPlus12: 50, powerMinus12: 10, power5V: 0 },
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.hp.status !== 'PASS' || res.hp.remaining !== 2) {
      throw new Error(`Expected HP status PASS with 2 HP remaining, got ${res?.hp.status} with ${res?.hp.remaining}HP`)
    }
  })

  await runTest('HP', 'Should PASS on exact HP capacity fit (62HP into 62HP)', () => {
    const modules: ModuleData[] = [
      { _id: 'm1', name: 'Module A', hp: 32, depthMM: 25, powerPlus12: 50, powerMinus12: 10, power5V: 0 },
      { _id: 'm2', name: 'Module B', hp: 30, depthMM: 25, powerPlus12: 50, powerMinus12: 10, power5V: 0 },
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.hp.status !== 'PASS' || res.hp.remaining !== 0) {
      throw new Error(`Expected 0 HP remaining on exact fit, got ${res?.hp.remaining}`)
    }
  })

  await runTest('HP', 'Should FAIL on HP overflow (64HP into 62HP case)', () => {
    const modules: ModuleData[] = [
      { _id: 'm1', name: 'Module A', hp: 34, depthMM: 25, powerPlus12: 50, powerMinus12: 10, power5V: 0 },
      { _id: 'm2', name: 'Module B', hp: 30, depthMM: 25, powerPlus12: 50, powerMinus12: 10, power5V: 0 },
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.hp.status !== 'FAIL' || res.hp.remaining !== -2) {
      throw new Error(`Expected HP status FAIL with -2HP remaining, got ${res?.hp.status}`)
    }
  })

  // --- 2. PHYSICAL DEPTH VALIDATION TESTS ---
  console.log(`\n▶ 2. PHYSICAL DEPTH ENGINE SUITE`)
  await runTest('Depth', 'Should PASS when module depth is comfortably below case max depth', () => {
    const modules: ModuleData[] = [
      { _id: 'm1', name: 'Plaits', hp: 12, depthMM: 25, powerPlus12: 50, powerMinus12: 5, power5V: 0 }
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.depth.status !== 'PASS' || res.depth.failingModules.length > 0) {
      throw new Error(`Expected depth status PASS, got ${res?.depth.status}`)
    }
  })

  await runTest('Depth', 'Should detect COLLISION when module depth exceeds case limit (55mm in 45.5mm case)', () => {
    const modules: ModuleData[] = [
      { _id: 'mod-doepfer-a110', name: 'Doepfer A-110-1', hp: 10, depthMM: 55, powerPlus12: 150, powerMinus12: 50, power5V: 0 }
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.depth.status !== 'FAIL' || res.depth.failingModules.length !== 1) {
      throw new Error(`Expected depth status FAIL with 1 failing module, got ${res?.depth.status}`)
    }
    const overrun = res.depth.failingModules[0].overrunMM
    if (overrun !== 9.5) {
      throw new Error(`Expected overrun of 9.5mm, got ${overrun}mm`)
    }
  })

  await runTest('Depth', 'Should warn when module depth approaches clearance buffer boundary (45.0mm in 45.5mm case)', () => {
    const modules: ModuleData[] = [
      { _id: 'm-tight', name: 'Tight Module', hp: 10, depthMM: 45.0, powerPlus12: 50, powerMinus12: 20, power5V: 0 }
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.depth.warningModules.length === 0) {
      throw new Error(`Expected warningModules to be populated for 45.0mm in 45.5mm case`)
    }
  })

  // --- 3. POWER RAIL AMBIENT & OVERLOAD TESTS ---
  console.log(`\n▶ 3. POWER RAIL ENGINE SUITE (+12V, -12V, +5V)`)
  await runTest('Power', 'Should PASS and compute percentage correctly for balanced power consumption', () => {
    const modules: ModuleData[] = [
      { _id: 'm1', name: 'Module A', hp: 10, depthMM: 20, powerPlus12: 600, powerMinus12: 300, power5V: 100 }
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.power.status !== 'PASS') {
      throw new Error(`Expected power status PASS, got ${res?.power.status}`)
    }
    if (res.power.plus12.percent !== 50 || res.power.minus12.percent !== 25 || res.power.plus5v.percent !== 20) {
      throw new Error(`Incorrect power rail percentages: +12V=${res.power.plus12.percent}%, -12V=${res.power.minus12.percent}%, 5V=${res.power.plus5v.percent}%`)
    }
  })

  await runTest('Power', 'Should set WARNING state when power draw reaches 80% inrush headroom limit', () => {
    const modules: ModuleData[] = [
      { _id: 'm1', name: 'Hungry Module', hp: 10, depthMM: 20, powerPlus12: 980, powerMinus12: 200, power5V: 0 }
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.power.plus12.status !== 'WARNING') {
      throw new Error(`Expected +12V status WARNING at 82% load, got ${res?.power.plus12.status}`)
    }
  })

  await runTest('Power', 'Should FAIL when power draw exceeds 100% of case rail capacity', () => {
    const modules: ModuleData[] = [
      { _id: 'm1', name: 'Power Hog', hp: 10, depthMM: 20, powerPlus12: 1350, powerMinus12: 200, power5V: 0 }
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.power.plus12.status !== 'FAIL' || res.status !== 'FAIL') {
      throw new Error(`Expected power failure on 1350mA vs 1200mA rail, got status ${res?.status}`)
    }
  })

  // --- 4. CONTRADICTION & USER DECISION TESTS ---
  console.log(`\n▶ 4. CONTRADICTION ENGINE & USER DECISION SUITE`)
  await runTest('Contradiction', 'Should detect unresolved contradiction on Make Noise Maths power specification', () => {
    const modules: ModuleData[] = [
      { _id: 'mod-maths', name: 'Maths', hp: 20, depthMM: 24, powerPlus12: 60, powerMinus12: 50, power5V: 0 }
    ]
    const res = validateRack({ case: testCase, modules })
    if (!res || res.detectedContradictions.length === 0) {
      throw new Error(`Expected detected contradiction for Make Noise Maths`)
    }
    const mathsCont = res.detectedContradictions[0]
    if (mathsCont.field !== 'powerPlus12' || mathsCont.resolved !== false) {
      throw new Error(`Expected unresolved powerPlus12 contradiction`)
    }
  })

  await runTest('Contradiction', 'Should apply persisted UserDecision and recalculate power rails dynamically', () => {
    const modules: ModuleData[] = [
      { _id: 'mod-maths', name: 'Maths', hp: 20, depthMM: 24, powerPlus12: 60, powerMinus12: 50, power5V: 0 }
    ]
    const decisions: UserDecisionDoc[] = [
      {
        _id: 'dec-test-1',
        _type: 'userDecision',
        entityId: 'mod-maths',
        field: 'powerPlus12',
        chosenValue: '90',
        chosenClaimId: 'claim-maths-90ma',
        rationale: 'Applied verified 2023 lab bench errata',
        context: 'Automated test suite',
        timestamp: new Date().toISOString(),
        active: true
      }
    ]

    const res = validateRack({ case: testCase, modules, userDecisions: decisions })
    if (!res) throw new Error('Validation returned null')
    
    // Maths should now calculate with 90mA instead of 60mA
    if (res.power.plus12.used !== 90) {
      throw new Error(`Expected powerPlus12 to use user decision 90mA, but got ${res.power.plus12.used}mA`)
    }
    const resolvedContradiction = res.detectedContradictions.find(c => c.moduleId === 'mod-maths')
    if (!resolvedContradiction?.resolved || resolvedContradiction.chosenValue !== '90mA') {
      throw new Error(`Contradiction not marked as resolved with 90mA`)
    }
  })

  // --- 5. SANITY CONTEXT MCP SUITE ---
  console.log(`\n▶ 5. SANITY CONTEXT MODEL CONTEXT PROTOCOL (MCP) SUITE`)
  await runTest('MCP', 'Should connect to MCP Server and list all registered tools', async () => {
    const client = await getSanityMCPClient()
    const tools = await client.listTools()
    if (!tools || tools.tools.length < 5) {
      throw new Error(`Expected at least 5 MCP tools, found ${tools?.tools.length}`)
    }
    const requiredTools = ['searchSanityKnowledge', 'getModule', 'getCase', 'getContradictions', 'validateRackDeterministic']
    for (const reqTool of requiredTools) {
      if (!tools.tools.some(t => t.name === reqTool)) {
        throw new Error(`Missing mandatory MCP tool: ${reqTool}`)
      }
    }
  })

  await runTest('MCP', 'Should execute searchSanityKnowledge("Mutable") through MCP client', async () => {
    const res = await executeMCPTool('searchSanityKnowledge', { query: 'Mutable' })
    if (!res || !Array.isArray(res.results) || res.results.length === 0) {
      throw new Error(`Expected search results for 'Mutable', got ${JSON.stringify(res)}`)
    }
  })

  await runTest('MCP', 'Should execute getModule("Maths") through MCP with full provenance citations', async () => {
    const res = await executeMCPTool('getModule', { nameOrId: 'Maths' })
    if (!res || !res.module || res.module.hp !== 20) {
      throw new Error(`Expected module Maths with 20HP, got ${JSON.stringify(res?.module)}`)
    }
    if (!res.module.sourceURL) {
      throw new Error(`Expected sourceURL provenance on Maths`)
    }
  })

  await runTest('MCP', 'Should execute validateRackDeterministic through MCP client', async () => {
    const val = await executeMCPTool('validateRackDeterministic', {
      caseId: 'case-palette-62',
      moduleIds: ['mod-plaits', 'mod-rings']
    })
    if (!val || val.status !== 'PASS') {
      throw new Error(`Expected validation status PASS for Plaits + Rings in Palette 62, got ${val?.status}`)
    }
  })

  // --- FINAL REPORT ---
  const passedCount = reports.filter(r => r.passed).length
  const failedCount = reports.filter(r => !r.passed).length

  console.log(`\n======================================================`)
  console.log(`🏁 TEST EXECUTION COMPLETE`)
  console.log(`Total Tests: ${reports.length} | Passed: ${passedCount} | Failed: ${failedCount}`)
  console.log(`======================================================\n`)

  if (failedCount > 0) {
    process.exit(1)
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
