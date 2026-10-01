import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createSanityMCPServer } from './sanity-server'

export interface MCPLogEntry {
  id: string
  timestamp: string
  type: 'call' | 'result' | 'error'
  toolName: string
  params?: any
  result?: any
  durationMs?: number
}

// Global in-memory log of real MCP transactions for UI inspection
export const mcpAuditLog: MCPLogEntry[] = []

let clientInstance: Client | null = null

export async function getSanityMCPClient(): Promise<Client> {
  if (clientInstance) {
    return clientInstance
  }

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = createSanityMCPServer()
  await server.connect(serverTransport)

  const client = new Client(
    {
      name: 'racksmith-agent-mcp-client',
      version: '1.2.0',
    },
    {
      capabilities: {},
    }
  )

  await client.connect(clientTransport)
  clientInstance = client
  return client
}

export async function executeMCPTool(toolName: string, args: Record<string, any> = {}): Promise<any> {
  const client = await getSanityMCPClient()
  const startTime = Date.now()
  const callId = `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  mcpAuditLog.unshift({
    id: callId,
    timestamp: new Date().toISOString(),
    type: 'call',
    toolName,
    params: args,
  })

  try {
    const response = await client.callTool({
      name: toolName,
      arguments: args,
    })

    const durationMs = Date.now() - startTime
    let parsedResult = response

    // Parse text content if present
    if (response.content && Array.isArray(response.content) && response.content[0]?.type === 'text') {
      try {
        parsedResult = JSON.parse(response.content[0].text)
      } catch {
        parsedResult = response.content[0].text
      }
    }

    mcpAuditLog.unshift({
      id: `${callId}-res`,
      timestamp: new Date().toISOString(),
      type: 'result',
      toolName,
      result: parsedResult,
      durationMs,
    })

    // Keep log at max 50 entries
    if (mcpAuditLog.length > 50) mcpAuditLog.length = 50

    return parsedResult
  } catch (err: any) {
    const durationMs = Date.now() - startTime
    mcpAuditLog.unshift({
      id: `${callId}-err`,
      timestamp: new Date().toISOString(),
      type: 'error',
      toolName,
      result: err.message,
      durationMs,
    })
    throw err
  }
}
