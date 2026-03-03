/**
 * Quick script to re-generate a site for a given business ID.
 * Usage: npx tsx --tsconfig tsconfig.json scripts/regen-site.ts <businessId>
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envPath = resolve(__dirname, '../.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    const value = trimmed.slice(eqIdx + 1)
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  console.warn('Could not load .env.local')
}

async function main() {
  const businessId = process.argv[2]
  if (!businessId) {
    console.error('Usage: npx tsx scripts/regen-site.ts <businessId>')
    process.exit(1)
  }

  console.log(`Generating site for business ${businessId}...`)
  const { generateSite } = await import('../src/lib/ai/generate-site')
  const result = await generateSite(businessId)

  console.log('\nDone!')
  console.log(`  Site ID: ${result.siteId}`)
  console.log(`  Service pages: ${result.content.service_pages.length}`)
  console.log(`  FAQ questions: ${result.content.faq_page.questions.length}`)
  console.log(`  Section order: ${result.content.homepage.section_order.join(', ')}`)
  console.log(`  Confidence: ${result.content.content_metadata.data_confidence}`)
  console.log(`  Sections included: ${result.content.content_metadata.sections_included.join(', ')}`)
  console.log(`  Sections omitted: ${result.content.content_metadata.sections_omitted.join(', ') || '(none)'}`)
  console.log(`  Default fields: ${result.content.content_metadata.default_fields.join(', ') || '(none)'}`)
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
