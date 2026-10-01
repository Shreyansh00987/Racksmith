import { client } from './client'
import {
  SEED_CASES,
  SEED_MODULES,
  SEED_CONTRADICTIONS,
  SEED_COMPATIBILITY_RULES,
  SEED_MANUFACTURERS,
  ModuleDoc,
  CaseDoc,
  ContradictionDoc,
  ClaimDoc,
  CompatibilityRuleDoc,
  ManufacturerDoc
} from './seed-data'

export interface UserDecisionDoc {
  _id: string
  _type: 'userDecision'
  entityId: string
  field: string
  chosenValue: string | number
  chosenClaimId: string
  rationale: string
  context: string
  timestamp: string
  active: boolean
}

// In-memory cache for user decisions during the session
let userDecisionsCache: UserDecisionDoc[] = [
  // Default: Maths power draw starts unselected or can be seeded
]

export class KnowledgeBase {
  private static liveSanityAvailable: boolean | null = null

  static async testConnection(): Promise<boolean> {
    try {
      const res = await client.fetch('*[_type == "module"][0...1]')
      this.liveSanityAvailable = Array.isArray(res)
      return this.liveSanityAvailable
    } catch {
      this.liveSanityAvailable = false
      return false
    }
  }

  static async getAllModules(): Promise<ModuleDoc[]> {
    try {
      const live = await client.fetch(`*[_type == "module"]{
        _id, _type, name, hp, depthMM, powerPlus12, powerMinus12, power5V,
        sourceURL, revision, category, description,
        "manufacturerName": manufacturer->name,
        "manufacturerId": manufacturer->_ref
      }`)
      if (live && live.length >= 3) {
        // Merge with seed modules to ensure full catalog coverage
        const liveIds = new Set(live.map((m: any) => m._id))
        const remainingSeed = SEED_MODULES.filter(m => !liveIds.has(m._id))
        return [...live, ...remainingSeed]
      }
    } catch (e) {
      console.warn('Sanity live fetch fell back to curated dataset:', (e as Error).message)
    }
    return SEED_MODULES
  }

  static async getModule(idOrName: string): Promise<ModuleDoc | null> {
    if (!idOrName || typeof idOrName !== 'string') return null
    const modules = await this.getAllModules()
    const query = idOrName.toLowerCase().trim()
    return modules.find(m => 
      m._id === idOrName || 
      m.name.toLowerCase() === query || 
      m.name.toLowerCase().includes(query) || 
      query.includes(m.name.toLowerCase())
    ) || null
  }

  static async getAllCases(): Promise<CaseDoc[]> {
    try {
      const live = await client.fetch(`*[_type == "case"]{
        _id, _type, name, hp, maxDepthMM, powerCapacityPlus12, powerCapacityMinus12, powerCapacity5V,
        busBoardType, sourceURL, revision,
        "manufacturerName": manufacturer->name,
        "manufacturerId": manufacturer->_ref
      }`)
      if (live && live.length >= 1) {
        const liveIds = new Set(live.map((c: any) => c._id))
        const remainingSeed = SEED_CASES.filter(c => !liveIds.has(c._id))
        return [...live, ...remainingSeed]
      }
    } catch (e) {
      console.warn('Sanity live fetch fell back to curated cases:', (e as Error).message)
    }
    return SEED_CASES
  }

  static async getCase(idOrName: string): Promise<CaseDoc | null> {
    if (!idOrName || typeof idOrName !== 'string') return null
    const cases = await this.getAllCases()
    const query = idOrName.toLowerCase().trim()
    return cases.find(c => 
      c._id === idOrName || 
      c.name.toLowerCase() === query || 
      c.name.toLowerCase().includes(query) || 
      query.includes(c.name.toLowerCase())
    ) || null
  }

  static async getContradictions(entityId?: string): Promise<ContradictionDoc[]> {
    try {
      const filter = entityId ? `&& (entityId == "${entityId}" || claimA->entityId == "${entityId}")` : ''
      const live = await client.fetch(`*[_type == "contradiction" ${filter}]{
        _id, _type, status, explanation,
        "claimA": claimA->{_id, _type, statement, entityId, entityType, field, value, source, sourceURL, confidence, revision, context},
        "claimB": claimB->{_id, _type, statement, entityId, entityType, field, value, source, sourceURL, confidence, revision, context}
      }`)
      if (live && live.length > 0) {
        return live.map((c: any) => ({
          _id: c._id,
          _type: 'contradiction',
          entityId: c.claimA?.entityId || 'mod-maths',
          entityName: c.claimA?.entityId === 'mod-maths' ? 'Make Noise Maths' : c._id,
          field: c.claimA?.field || 'powerPlus12',
          claimA: c.claimA,
          claimB: c.claimB,
          status: c.status || 'unresolved',
          explanation: c.explanation,
          impactAnalysis: 'Discrepancy impacts electrical power rail budgeting or depth boundary fit.'
        }))
      }
    } catch (e) {
      console.warn('Sanity live contradictions fell back to curated dataset:', (e as Error).message)
    }

    if (entityId) {
      return SEED_CONTRADICTIONS.filter(c => c.entityId === entityId)
    }
    return SEED_CONTRADICTIONS
  }

  static async getCompatibilityRules(moduleId?: string, caseId?: string): Promise<CompatibilityRuleDoc[]> {
    let rules = SEED_COMPATIBILITY_RULES
    if (moduleId) {
      rules = rules.filter(r => r.moduleId === moduleId)
    }
    if (caseId) {
      rules = rules.filter(r => r.caseId === caseId)
    }
    return rules
  }

  static async searchKnowledge(query: string, type?: string): Promise<any[]> {
    if (!query || typeof query !== 'string') return []
    const q = query.toLowerCase().trim()
    const tokens = q.split(/[\s,./?!]+/).filter(t => t.length >= 3)
    const results: any[] = []

    const matches = (text?: string) => {
      if (!text) return false
      const lower = text.toLowerCase()
      if (lower.includes(q) || q.includes(lower)) return true
      return tokens.some(tok => lower.includes(tok))
    }

    if (!type || type === 'case') {
      const cases = await this.getAllCases()
      for (const c of cases) {
        if (matches(c.name) || matches(c.manufacturerName)) {
          results.push({ ...c, kind: 'Case Specification', relevance: 'Case Hardware' })
        }
      }
    }

    if (!type || type === 'module') {
      const modules = await this.getAllModules()
      for (const m of modules) {
        if (matches(m.name) || matches(m.manufacturerName) || matches(m.description) || matches(m.category)) {
          results.push({ ...m, kind: 'Module Technical Spec', relevance: 'Module Hardware' })
        }
      }
    }

    if (!type || type === 'contradiction' || type === 'claim') {
      const contradictions = await this.getContradictions()
      for (const con of contradictions) {
        if (matches(con.entityName) || matches(con.explanation) || matches(con.field)) {
          results.push({ ...con, kind: 'Specification Conflict', relevance: 'Provenanced Contradiction' })
        }
      }
    }

    return results
  }

  static async saveUserDecision(decision: Omit<UserDecisionDoc, '_id' | '_type' | 'timestamp' | 'active'>): Promise<UserDecisionDoc> {
    const newDecision: UserDecisionDoc = {
      _id: `decision-${Date.now()}`,
      _type: 'userDecision',
      ...decision,
      timestamp: new Date().toISOString(),
      active: true
    }

    // Deactivate previous active decisions for the same entity and field
    userDecisionsCache = userDecisionsCache.map(d => {
      if (d.entityId === decision.entityId && d.field === decision.field) {
        return { ...d, active: false }
      }
      return d
    })

    userDecisionsCache.push(newDecision)

    // Try to persist to live Sanity if write token is present
    try {
      if (process.env.SANITY_API_TOKEN) {
        await client.create({
          _type: 'userDecision',
          chosenClaim: { _type: 'reference', _ref: decision.chosenClaimId },
          rationale: decision.rationale,
          context: decision.context,
          active: true
        })
      }
    } catch (e) {
      console.warn('Could not write userDecision to Sanity cloud, saved to session cache:', (e as Error).message)
    }

    return newDecision
  }

  static async getUserDecisions(entityId?: string): Promise<UserDecisionDoc[]> {
    if (entityId) {
      return userDecisionsCache.filter(d => d.entityId === entityId && d.active)
    }
    return userDecisionsCache.filter(d => d.active)
  }
}
