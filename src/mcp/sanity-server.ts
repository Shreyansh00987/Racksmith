import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { KnowledgeBase } from '../sanity/knowledge'
import { validateRack } from '../lib/validation'

export function createSanityMCPServer() {
  const server = new Server(
    {
      name: 'sanity-context',
      version: '1.2.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'searchSanityKnowledge',
          description: 'Search the Sanity Knowledge Base for modular synth specifications, modules, cases, and claims.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The search query (e.g. ambient, filter, Intellijel, 62HP)' },
              type: { type: 'string', description: 'Filter by type: module, case, contradiction, claim' },
            },
            required: ['query'],
          },
        },
        {
          name: 'getModule',
          description: 'Retrieve structured technical specifications and source provenance for a specific Eurorack module.',
          inputSchema: {
            type: 'object',
            properties: {
              nameOrId: { type: 'string', description: 'Module name (e.g. Maths, Plaits, A-110-1) or document ID' },
            },
            required: ['nameOrId'],
          },
        },
        {
          name: 'getCase',
          description: 'Retrieve case specifications including rail power capacities and maximum clearance depth.',
          inputSchema: {
            type: 'object',
            properties: {
              nameOrId: { type: 'string', description: 'Case name (e.g. Palette 62, Intellijel 7U 84HP) or ID' },
            },
            required: ['nameOrId'],
          },
        },
        {
          name: 'getContradictions',
          description: 'Fetch documented specification conflicts, contradictory manufacturer claims, and errata.',
          inputSchema: {
            type: 'object',
            properties: {
              moduleId: { type: 'string', description: 'Optional module ID to filter contradictions' },
            },
          },
        },
        {
          name: 'getCompatibilityRules',
          description: 'Fetch mechanical and physical compatibility rules for specific module and case pairings.',
          inputSchema: {
            type: 'object',
            properties: {
              moduleId: { type: 'string' },
              caseId: { type: 'string' },
            },
          },
        },
        {
          name: 'validateRackDeterministic',
          description: 'Deterministically validate a proposed rack build for HP width, power draw per rail, and physical depth collision.',
          inputSchema: {
            type: 'object',
            properties: {
              caseId: { type: 'string', description: 'Case ID or name' },
              moduleIds: { type: 'array', items: { type: 'string' }, description: 'List of module IDs or names' },
            },
            required: ['caseId', 'moduleIds'],
          },
        },
        {
          name: 'saveUserDecision',
          description: 'Persist a user decision when resolving contradictory module specifications in Sanity.',
          inputSchema: {
            type: 'object',
            properties: {
              entityId: { type: 'string', description: 'Module or Case ID' },
              field: { type: 'string', description: 'Field name (e.g. powerPlus12, depthMM)' },
              chosenValue: { type: 'string', description: 'The chosen specification value' },
              chosenClaimId: { type: 'string', description: 'The claim ID chosen by the user' },
              rationale: { type: 'string', description: 'Why this claim was chosen' },
              context: { type: 'string', description: 'Build context' },
            },
            required: ['entityId', 'field', 'chosenValue', 'chosenClaimId', 'rationale'],
          },
        },
        {
          name: 'getUserDecisions',
          description: 'Retrieve stored user decisions to ensure consistent specification choices across builds.',
          inputSchema: {
            type: 'object',
            properties: {
              entityId: { type: 'string' },
            },
          },
        }
      ],
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    if (name === 'searchSanityKnowledge') {
      const { query, type } = (args || {}) as { query: string; type?: string }
      const results = await KnowledgeBase.searchKnowledge(query, type)
      return {
        content: [{ type: 'text', text: JSON.stringify({ count: results.length, results }, null, 2) }],
      }
    }

    if (name === 'getModule') {
      const target = (args as any)?.nameOrId || (args as any)?.name || (args as any)?.id || ''
      const mod = await KnowledgeBase.getModule(target)
      if (!mod) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Module not found: ${target}` }],
        }
      }
      const contradictions = await KnowledgeBase.getContradictions(mod._id)
      return {
        content: [{ type: 'text', text: JSON.stringify({ module: mod, activeContradictions: contradictions }, null, 2) }],
      }
    }

    if (name === 'getCase') {
      const target = (args as any)?.nameOrId || (args as any)?.name || (args as any)?.id || ''
      const c = await KnowledgeBase.getCase(target)
      if (!c) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Case not found: ${target}` }],
        }
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(c, null, 2) }],
      }
    }

    if (name === 'getContradictions') {
      const { moduleId } = (args || {}) as { moduleId?: string }
      const contradictions = await KnowledgeBase.getContradictions(moduleId)
      return {
        content: [{ type: 'text', text: JSON.stringify(contradictions, null, 2) }],
      }
    }

    if (name === 'getCompatibilityRules') {
      const { moduleId, caseId } = (args || {}) as { moduleId?: string; caseId?: string }
      const rules = await KnowledgeBase.getCompatibilityRules(moduleId, caseId)
      return {
        content: [{ type: 'text', text: JSON.stringify(rules, null, 2) }],
      }
    }

    if (name === 'validateRackDeterministic') {
      const { caseId, moduleIds } = (args || {}) as { caseId: string; moduleIds: string[] }
      const targetCase = await KnowledgeBase.getCase(caseId)
      if (!targetCase) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Case '${caseId}' not found.` }],
        }
      }

      const allModules = await KnowledgeBase.getAllModules()
      const resolvedModules = moduleIds.map(id => {
        return allModules.find(m => m._id === id || m.name.toLowerCase() === id.toLowerCase()) || {
          _id: id,
          name: id,
          hp: 0,
          depthMM: 0,
          powerPlus12: 0,
          powerMinus12: 0,
          power5V: 0
        }
      })

      const decisions = await KnowledgeBase.getUserDecisions()
      const validation = validateRack({
        case: targetCase,
        modules: resolvedModules,
        userDecisions: decisions
      })

      return {
        content: [{ type: 'text', text: JSON.stringify(validation, null, 2) }],
      }
    }

    if (name === 'saveUserDecision') {
      const dec = (args || {}) as any
      const saved = await KnowledgeBase.saveUserDecision(dec)
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: true, saved }, null, 2) }],
      }
    }

    if (name === 'getUserDecisions') {
      const { entityId } = (args || {}) as { entityId?: string }
      const decisions = await KnowledgeBase.getUserDecisions(entityId)
      return {
        content: [{ type: 'text', text: JSON.stringify(decisions, null, 2) }],
      }
    }

    throw new Error(`Tool not found: ${name}`)
  })

  return server
}

// Standalone runner for stdio MCP execution
if (require.main === module) {
  const server = createSanityMCPServer()
  const transport = new StdioServerTransport()
  server.connect(transport).then(() => {
    console.error('Sanity Context MCP server running via stdio transport')
  }).catch(console.error)
}
