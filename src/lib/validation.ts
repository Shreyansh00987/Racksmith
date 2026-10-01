import { UserDecisionDoc } from '../sanity/knowledge'

export interface ModuleData {
  _id: string
  name: string
  manufacturerName?: string
  hp: number
  depthMM: number
  powerPlus12: number
  powerMinus12: number
  power5V: number
  sourceURL?: string
  revision?: string
  category?: string
  description?: string
}

export interface CaseData {
  _id: string
  name: string
  manufacturerName?: string
  hp: number
  maxDepthMM: number
  powerCapacityPlus12: number
  powerCapacityMinus12: number
  powerCapacity5V: number
  busBoardType?: string
  sourceURL?: string
  revision?: string
}

export interface RackState {
  case: CaseData | null
  modules: ModuleData[]
  userDecisions?: UserDecisionDoc[]
}

export interface PowerRailResult {
  used: number
  total: number
  percent: number
  remaining: number
  status: 'PASS' | 'WARNING' | 'FAIL'
}

export interface ValidationResult {
  status: 'PASS' | 'WARNING' | 'FAIL'
  hp: {
    used: number
    total: number
    remaining: number
    percent: number
    status: 'PASS' | 'FAIL'
  }
  power: {
    plus12: PowerRailResult
    minus12: PowerRailResult
    plus5v: PowerRailResult
    status: 'PASS' | 'WARNING' | 'FAIL'
    notes: string[]
  }
  depth: {
    maxModuleDepth: number
    caseMaxDepth: number
    status: 'PASS' | 'WARNING' | 'FAIL'
    failingModules: Array<{
      module: ModuleData
      depthMM: number
      overrunMM: number
      sourceURL?: string
      revision?: string
    }>
    warningModules: Array<{
      module: ModuleData
      depthMM: number
      clearanceMM: number
    }>
  }
  detectedContradictions: Array<{
    moduleId: string
    moduleName: string
    field: string
    claimAValue: string | number
    claimBValue: string | number
    chosenValue?: string | number
    resolved: boolean
  }>
  summary: string
}

export function validateRack(rack: RackState): ValidationResult | null {
  const targetCase = rack.case
  if (!targetCase) return null

  const userDecisions = rack.userDecisions || []

  // Resolve module specifications considering user decisions
  const resolvedModules = rack.modules.map(m => {
    const copy = { ...m }
    
    // Check if user made a decision on powerPlus12 for this module
    const powerDecision = userDecisions.find(d => d.entityId === m._id && d.field === 'powerPlus12' && d.active)
    if (powerDecision) {
      copy.powerPlus12 = Number(powerDecision.chosenValue)
    }

    // Check if user made a decision on depthMM for this module
    const depthDecision = userDecisions.find(d => d.entityId === m._id && d.field === 'depthMM' && d.active)
    if (depthDecision) {
      copy.depthMM = Number(depthDecision.chosenValue)
    }

    return copy
  })

  // 1. HP Validation
  const usedHP = resolvedModules.reduce((sum, m) => sum + (m.hp || 0), 0)
  const remainingHP = targetCase.hp - usedHP
  const hpPercent = Math.round((usedHP / targetCase.hp) * 100)
  const hpStatus = remainingHP >= 0 ? 'PASS' : 'FAIL'

  // 2. Depth Validation
  const clearanceBuffer = 1.0 // 1mm buffer for rear pins
  const failingModules: Array<{
    module: ModuleData
    depthMM: number
    overrunMM: number
    sourceURL?: string
    revision?: string
  }> = []

  const warningModules: Array<{
    module: ModuleData
    depthMM: number
    clearanceMM: number
  }> = []

  let maxModuleDepth = 0

  for (const m of resolvedModules) {
    const depth = m.depthMM || 0
    if (depth > maxModuleDepth) maxModuleDepth = depth

    if (depth > targetCase.maxDepthMM) {
      failingModules.push({
        module: m,
        depthMM: depth,
        overrunMM: Number((depth - targetCase.maxDepthMM).toFixed(1)),
        sourceURL: m.sourceURL,
        revision: m.revision
      })
    } else if (depth + clearanceBuffer >= targetCase.maxDepthMM) {
      warningModules.push({
        module: m,
        depthMM: depth,
        clearanceMM: Number((targetCase.maxDepthMM - depth).toFixed(1))
      })
    }
  }

  const depthStatus = failingModules.length > 0 ? 'FAIL' : warningModules.length > 0 ? 'WARNING' : 'PASS'

  // 3. Power Validation
  const usedPlus12 = resolvedModules.reduce((sum, m) => sum + (m.powerPlus12 || 0), 0)
  const usedMinus12 = resolvedModules.reduce((sum, m) => sum + (m.powerMinus12 || 0), 0)
  const used5v = resolvedModules.reduce((sum, m) => sum + (m.power5V || 0), 0)

  const calcRail = (used: number, total: number): PowerRailResult => {
    if (total <= 0) {
      return {
        used,
        total: 0,
        percent: used > 0 ? 100 : 0,
        remaining: 0,
        status: used > 0 ? 'FAIL' : 'PASS'
      }
    }
    const percent = Math.round((used / total) * 100)
    const remaining = total - used
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS'
    if (percent > 100) status = 'FAIL'
    else if (percent >= 80) status = 'WARNING'

    return { used, total, percent, remaining, status }
  }

  const plus12 = calcRail(usedPlus12, targetCase.powerCapacityPlus12)
  const minus12 = calcRail(usedMinus12, targetCase.powerCapacityMinus12)
  const plus5v = calcRail(used5v, targetCase.powerCapacity5V)

  const powerNotes: string[] = []
  if (plus12.status === 'FAIL') powerNotes.push(`+12V overloaded: ${plus12.used}mA draws ${plus12.percent}% of ${plus12.total}mA limit.`)
  else if (plus12.status === 'WARNING') powerNotes.push(`+12V rail headroom low (${plus12.percent}% used). Eurorack best practice recommends staying under 80% to absorb transient inrush current.`)

  if (minus12.status === 'FAIL') powerNotes.push(`-12V overloaded: ${minus12.used}mA draws ${minus12.percent}% of ${minus12.total}mA limit.`)
  else if (minus12.status === 'WARNING') powerNotes.push(`-12V rail at ${minus12.percent}% capacity.`)

  if (plus5v.status === 'FAIL') powerNotes.push(`+5V overloaded: ${plus5v.used}mA draws ${plus5v.percent}% of ${plus5v.total}mA capacity.`)

  const powerOverallStatus =
    plus12.status === 'FAIL' || minus12.status === 'FAIL' || plus5v.status === 'FAIL'
      ? 'FAIL'
      : plus12.status === 'WARNING' || minus12.status === 'WARNING' || plus5v.status === 'WARNING'
      ? 'WARNING'
      : 'PASS'

  // 4. Detected Contradictions
  const detectedContradictions: ValidationResult['detectedContradictions'] = []
  for (const m of resolvedModules) {
    if (m._id === 'mod-maths') {
      const activeDec = userDecisions.find(d => d.entityId === m._id && d.field === 'powerPlus12' && d.active)
      detectedContradictions.push({
        moduleId: m._id,
        moduleName: m.name,
        field: 'powerPlus12',
        claimAValue: '60mA (Manual 2022)',
        claimBValue: '90mA (Lab Errata 2023)',
        chosenValue: activeDec ? `${activeDec.chosenValue}mA` : undefined,
        resolved: !!activeDec
      })
    }
    if (m._id === 'mod-rainmaker') {
      const activeDec = userDecisions.find(d => d.entityId === m._id && d.field === 'depthMM' && d.active)
      detectedContradictions.push({
        moduleId: m._id,
        moduleName: m.name,
        field: 'depthMM',
        claimAValue: '42mm (Spec Sheet)',
        claimBValue: '46mm (Ribbon Cable Attached)',
        chosenValue: activeDec ? `${activeDec.chosenValue}mm` : undefined,
        resolved: !!activeDec
      })
    }
    if (m._id === 'mod-doepfer-a110') {
      const activeDec = userDecisions.find(d => d.entityId === m._id && d.field === 'depthMM' && d.active)
      detectedContradictions.push({
        moduleId: m._id,
        moduleName: m.name,
        field: 'depthMM',
        claimAValue: '65mm (Vintage THT)',
        claimBValue: '50mm (Modern SMD)',
        chosenValue: activeDec ? `${activeDec.chosenValue}mm` : undefined,
        resolved: !!activeDec
      })
    }
  }

  // 5. Overall System Status
  const overallStatus: 'PASS' | 'WARNING' | 'FAIL' =
    hpStatus === 'FAIL' || depthStatus === 'FAIL' || powerOverallStatus === 'FAIL'
      ? 'FAIL'
      : depthStatus === 'WARNING' || powerOverallStatus === 'WARNING'
      ? 'WARNING'
      : 'PASS'

  let summary = 'Rack configuration meets all mechanical and electrical Eurorack constraints.'
  if (overallStatus === 'FAIL') {
    const reasons: string[] = []
    if (hpStatus === 'FAIL') reasons.push(`HP capacity exceeded by ${Math.abs(remainingHP)}HP`)
    if (depthStatus === 'FAIL') reasons.push(`${failingModules.map(f => `${f.module.name} (${f.depthMM}mm vs ${targetCase.maxDepthMM}mm)`).join(', ')} physically collide with case bus board`)
    if (powerOverallStatus === 'FAIL') reasons.push('Power supply rails exceeded')
    summary = `CRITICAL FAILURE: ${reasons.join('; ')}.`
  } else if (overallStatus === 'WARNING') {
    summary = `WARNING: Review power headroom or tight depth clearance (${powerNotes.join(' ')}).`
  }

  return {
    status: overallStatus,
    hp: {
      used: usedHP,
      total: targetCase.hp,
      remaining: remainingHP,
      percent: hpPercent,
      status: hpStatus
    },
    power: {
      plus12,
      minus12,
      plus5v,
      status: powerOverallStatus,
      notes: powerNotes
    },
    depth: {
      maxModuleDepth,
      caseMaxDepth: targetCase.maxDepthMM,
      status: depthStatus,
      failingModules,
      warningModules
    },
    detectedContradictions,
    summary
  }
}
