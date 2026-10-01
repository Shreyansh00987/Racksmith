import { NextResponse } from 'next/server'

// Redirect /api/chat requests to our full MCP-enabled agent route
export async function POST(req: Request) {
  const url = new URL('/api/agent', req.url)
  const body = await req.json()
  
  // Convert standard chat messages format to agent prompt
  const lastUserMsg = body.messages ? body.messages.filter((m: any) => m.role === 'user').pop()?.content : body.prompt
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: lastUserMsg || 'Hello Racksmith',
      currentCase: body.currentCase,
      modules: body.modules,
      userDecisions: body.userDecisions
    })
  })
  
  const data = await response.json()
  return NextResponse.json(data)
}
