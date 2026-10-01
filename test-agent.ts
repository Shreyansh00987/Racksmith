import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { generateText, tool } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { executeMCPTool } from './src/mcp/client'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

async function testAgent() {
  console.log('Testing Agent with Gemini 3.8 and Sanity Context MCP...')
  const result = await generateText({
    model: google('gemini-3.8-flash'),
    system: 'You are the Racksmith modular synthesizer engineering agent. Always query the MCP tools for technical specs and contradictions.',
    prompt: 'Check the specifications and any known contradictions for Make Noise Maths.',
    tools: {
      searchSanityKnowledge: tool({
        description: 'Query Sanity Context MCP Knowledge Base for modules, cases, and claims',
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          console.log(`[AGENT -> MCP] Calling searchSanityKnowledge("${query}")`)
          return await executeMCPTool('searchSanityKnowledge', { query })
        }
      }),
      getModule: tool({
        description: 'Retrieve structured technical specs for a module via Sanity MCP',
        parameters: z.object({
          nameOrId: z.string(),
        }),
        execute: async ({ nameOrId }) => {
          console.log(`[AGENT -> MCP] Calling getModule("${nameOrId}")`)
          return await executeMCPTool('getModule', { nameOrId })
        }
      }),
      getContradictions: tool({
        description: 'Retrieve documented specification contradictions via Sanity MCP',
        parameters: z.object({
          moduleId: z.string().optional(),
        }),
        execute: async ({ moduleId }) => {
          console.log(`[AGENT -> MCP] Calling getContradictions("${moduleId || ''}")`)
          return await executeMCPTool('getContradictions', { moduleId })
        }
      })
    },
    maxSteps: 4,
  })

  console.log('\n=== AGENT RESPONSE ===\n', result.text)
  console.log('\n=== TOOL CALLS MADE ===\n', result.steps.map(s => s.toolCalls.map(tc => tc.toolName)))
}

testAgent().catch(console.error)
