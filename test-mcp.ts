import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { getSanityMCPClient, executeMCPTool } from './src/mcp/client'

async function testMCP() {
  console.log('Connecting to Sanity Context MCP...')
  const client = await getSanityMCPClient()
  const tools = await client.listTools()
  console.log(`✅ MCP Client connected! Available tools (${tools.tools.length}):`)
  tools.tools.forEach(t => console.log(`  - ${t.name}: ${t.description.slice(0, 60)}...`))

  console.log('\nExecuting MCP tool: searchSanityKnowledge("Maths")...')
  const searchRes = await executeMCPTool('searchSanityKnowledge', { query: 'Maths' })
  console.log('Search result:', JSON.stringify(searchRes, null, 2))

  console.log('\nExecuting MCP tool: getContradictions()...')
  const contradictions = await executeMCPTool('getContradictions', {})
  console.log(`Retrieved ${contradictions?.length || 0} contradictions from MCP.`)

  console.log('\nExecuting MCP tool: validateRackDeterministic()...')
  const validation = await executeMCPTool('validateRackDeterministic', {
    caseId: 'case-palette-62',
    moduleIds: ['mod-maths', 'mod-doepfer-a110']
  })
  console.log('Deterministic validation status:', validation.status)
  console.log('Depth issue detected:', validation.depth.status, validation.depth.failingModules?.map((m: any) => `${m.module.name} (${m.depthMM}mm > ${validation.depth.caseMaxDepth}mm)`))
}

testMCP().catch(console.error)
