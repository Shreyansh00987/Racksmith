import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import {
  SEED_MANUFACTURERS,
  SEED_CASES,
  SEED_MODULES,
  SEED_CONTRADICTIONS,
  SEED_COMPATIBILITY_RULES,
} from './seed-data'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'r674mqrk',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-15',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function seed() {
  console.log(`\n========================================`)
  console.log(`🌱 SEEDING RACKSMITH KNOWLEDGE BASE INTO SANITY`)
  console.log(`Project: ${client.config().projectId} | Dataset: ${client.config().dataset}`)
  console.log(`========================================\n`)

  // 1. Seed Manufacturers
  console.log(`📦 Seeding ${SEED_MANUFACTURERS.length} Manufacturers...`)
  for (const mfg of SEED_MANUFACTURERS) {
    await client.createOrReplace({
      _id: mfg._id,
      _type: 'manufacturer',
      name: mfg.name,
      website: mfg.website,
      description: mfg.description,
    })
  }
  console.log(`✅ Manufacturers seeded.`)

  // 2. Seed Cases
  console.log(`📦 Seeding ${SEED_CASES.length} Cases...`)
  for (const c of SEED_CASES) {
    await client.createOrReplace({
      _id: c._id,
      _type: 'case',
      name: c.name,
      manufacturer: { _type: 'reference', _ref: c.manufacturerId },
      hp: c.hp,
      maxDepthMM: c.maxDepthMM,
      powerCapacityPlus12: c.powerCapacityPlus12,
      powerCapacityMinus12: c.powerCapacityMinus12,
      powerCapacity5V: c.powerCapacity5V,
      busBoardType: c.busBoardType,
      sourceURL: c.sourceURL,
      revision: c.revision,
    })
  }
  console.log(`✅ Cases seeded.`)

  // 3. Seed Modules
  console.log(`📦 Seeding ${SEED_MODULES.length} Eurorack Modules...`)
  for (const mod of SEED_MODULES) {
    await client.createOrReplace({
      _id: mod._id,
      _type: 'module',
      name: mod.name,
      manufacturer: { _type: 'reference', _ref: mod.manufacturerId },
      hp: mod.hp,
      depthMM: mod.depthMM,
      widthMM: Math.round(mod.hp * 5.08), // Standard Eurorack 1 HP = 5.08mm
      powerPlus12: mod.powerPlus12,
      powerMinus12: mod.powerMinus12,
      power5V: mod.power5V,
      connectorType: mod.connectorType || '10-to-16 pin ribbon',
      sourceURL: mod.sourceURL,
      revision: mod.revision || 'v1.0',
    })
  }
  console.log(`✅ Modules seeded.`)

  // 4. Seed Claims and Contradictions
  console.log(`📦 Seeding Claims & Contradictions...`)
  for (const cont of SEED_CONTRADICTIONS) {
    // Seed Claim A
    await client.createOrReplace({
      _id: cont.claimA._id,
      _type: 'claim',
      statement: cont.claimA.statement,
      entityId: cont.claimA.entityId,
      entityType: cont.claimA.entityType,
      field: cont.claimA.field,
      value: cont.claimA.value,
      source: cont.claimA.source,
      confidence: cont.claimA.confidence,
      revision: cont.claimA.revision,
      context: cont.claimA.context,
    })

    // Seed Claim B
    await client.createOrReplace({
      _id: cont.claimB._id,
      _type: 'claim',
      statement: cont.claimB.statement,
      entityId: cont.claimB.entityId,
      entityType: cont.claimB.entityType,
      field: cont.claimB.field,
      value: cont.claimB.value,
      source: cont.claimB.source,
      confidence: cont.claimB.confidence,
      revision: cont.claimB.revision,
      context: cont.claimB.context,
    })

    // Seed Contradiction document linking both claims
    await client.createOrReplace({
      _id: cont._id,
      _type: 'contradiction',
      claimA: { _type: 'reference', _ref: cont.claimA._id },
      claimB: { _type: 'reference', _ref: cont.claimB._id },
      status: cont.status,
      explanation: cont.explanation,
      resolution: `Contradiction documented between ${cont.claimA.source} and ${cont.claimB.source}. Impact: ${cont.impactAnalysis}`,
    })
  }
  console.log(`✅ Contradictions & Claims seeded.`)

  // 5. Seed Compatibility Rules
  console.log(`📦 Seeding Compatibility Rules...`)
  for (const rule of SEED_COMPATIBILITY_RULES) {
    await client.createOrReplace({
      _id: rule._id,
      _type: 'compatibilityRule',
      module: { _type: 'reference', _ref: rule.moduleId },
      case: { _type: 'reference', _ref: rule.caseId },
      clearanceRequired: rule.clearanceRequired,
      powerConstraints: rule.status,
      notes: rule.notes,
      source: rule.source,
    })
  }
  console.log(`✅ Compatibility Rules seeded.`)

  // 6. Verify Total Document Count
  const totalDocs = await client.fetch<any[]>('*[!(_type match "system.*")]')
  console.log(`\n🎉 Seed finished! Total documents in Sanity project '${client.config().projectId}': ${totalDocs.length}`)
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
