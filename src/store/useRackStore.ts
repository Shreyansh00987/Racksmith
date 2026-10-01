import { create } from 'zustand'
import { ModuleData, CaseData, ValidationResult, validateRack } from '../lib/validation'
import { UserDecisionDoc } from '../sanity/knowledge'

interface RackStore {
  currentCase: CaseData | null
  modules: ModuleData[]
  validation: ValidationResult | null
  userDecisions: UserDecisionDoc[]
  selectedModule: ModuleData | null
  activeConflictModal: any | null
  demoStep: number
  isDemoActive: boolean
  
  setCase: (c: CaseData) => void
  addModule: (m: ModuleData) => void
  removeModule: (index: number) => void
  clearRack: () => void
  revalidate: () => void
  setSelectedModule: (m: ModuleData | null) => void
  setActiveConflictModal: (conflict: any | null) => void
  setDemoStep: (step: number) => void
  setIsDemoActive: (active: boolean) => void
  applyUserDecision: (decision: UserDecisionDoc) => void
}

export const useRackStore = create<RackStore>((set, get) => ({
  currentCase: null,
  modules: [],
  validation: null,
  userDecisions: [],
  selectedModule: null,
  activeConflictModal: null,
  demoStep: 0,
  isDemoActive: false,

  setCase: (c: CaseData) => {
    set({ currentCase: c })
    get().revalidate()
  },

  addModule: (m: ModuleData) => {
    set((state) => ({ modules: [...state.modules, m] }))
    get().revalidate()
  },

  removeModule: (index: number) => {
    set((state) => {
      const newModules = [...state.modules]
      newModules.splice(index, 1)
      return { modules: newModules }
    })
    get().revalidate()
  },

  clearRack: () => {
    set({ modules: [] })
    get().revalidate()
  },

  setSelectedModule: (m: ModuleData | null) => {
    set({ selectedModule: m })
  },

  setActiveConflictModal: (conflict: any | null) => {
    set({ activeConflictModal: conflict })
  },

  setDemoStep: (step: number) => {
    set({ demoStep: step })
  },

  setIsDemoActive: (active: boolean) => {
    set({ isDemoActive: active })
  },

  applyUserDecision: (decision: UserDecisionDoc) => {
    set((state) => {
      // Replace or append decision
      const filtered = state.userDecisions.filter(
        d => !(d.entityId === decision.entityId && d.field === decision.field)
      )
      return { userDecisions: [...filtered, decision] }
    })
    get().revalidate()
  },

  revalidate: () => {
    const { currentCase, modules, userDecisions } = get()
    if (!currentCase) {
      set({ validation: null })
      return
    }
    const result = validateRack({ case: currentCase, modules, userDecisions })
    set({ validation: result })
  }
}))
