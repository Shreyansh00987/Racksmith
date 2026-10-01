import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { client } from './src/sanity/client'

async function main() {
  console.log('Testing client against project:', client.config().projectId)
  const [modules, cases, contradictions, claims, manufacturers, rules] = await Promise.all([
    client.fetch('count(*[_type == "module"])'),
    client.fetch('count(*[_type == "case"])'),
    client.fetch('count(*[_type == "contradiction"])'),
    client.fetch('count(*[_type == "claim"])'),
    client.fetch('count(*[_type == "manufacturer"])'),
    client.fetch('count(*[_type == "compatibilityRule"])'),
  ])

  console.log('📊 Sanity Content Lake Audit:')
  console.log(`- Modules: ${modules}`)
  console.log(`- Cases: ${cases}`)
  console.log(`- Contradictions: ${contradictions}`)
  console.log(`- Claims: ${claims}`)
  console.log(`- Manufacturers: ${manufacturers}`)
  console.log(`- Compatibility Rules: ${rules}`)

  // Test sample module fetch with resolved manufacturer
  const maths = await client.fetch(`*[_type == "module" && name == "Maths"][0]{
    _id, name, hp, depthMM, powerPlus12, powerMinus12,
    "manufacturer": manufacturer->name,
    sourceURL, revision
  }`)
  console.log('\n🔍 Sample Resolved Module (Maths):', maths)
}

main().catch(console.error)
