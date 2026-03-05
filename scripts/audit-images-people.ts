/**
 * Audit stock photos for images containing people.
 *
 * Usage:
 *   npx tsx scripts/audit-images-people.ts
 *
 * Requires:
 *   - ANTHROPIC_API_KEY in .env.local
 *
 * Fetches each Unsplash image and sends it to Claude's vision API
 * to check if the image contains people. Outputs a report of which
 * images should be replaced.
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load env from .env.local
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
  console.warn('Could not load .env.local, using existing env vars')
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in .env.local')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

interface ImageSource {
  hero: string
  about: string
}

// Same image sources as seed-images.ts
const CATEGORY_IMAGE_SOURCES: Record<string, ImageSource> = {
  plumber: {
    hero: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=500&fit=crop',
  },
  electrician: {
    hero: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?w=400&h=500&fit=crop',
  },
  hvac: {
    hero: 'https://images.unsplash.com/photo-1631545806609-2f7fd8e60c5a?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=500&fit=crop',
  },
  roofer: {
    hero: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&h=500&fit=crop',
  },
  general_contractor: {
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=500&fit=crop',
  },
  handyman: {
    hero: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=500&fit=crop',
  },
  auto_repair: {
    hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=500&fit=crop',
  },
  towing: {
    hero: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=500&fit=crop',
  },
  bakery: {
    hero: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1556217477-d325251ece38?w=400&h=500&fit=crop',
  },
  restaurant: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=500&fit=crop',
  },
  cafe: {
    hero: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=500&fit=crop',
  },
  bar: {
    hero: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=500&fit=crop',
  },
  florist: {
    hero: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=500&fit=crop',
  },
  dentist: {
    hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=500&fit=crop',
  },
  chiropractor: {
    hero: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1519823551278-64ac92734314?w=400&h=500&fit=crop',
  },
  veterinarian: {
    hero: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop',
  },
  spa: {
    hero: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=500&fit=crop',
  },
  yoga: {
    hero: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=500&fit=crop',
  },
  cleaning: {
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=500&fit=crop',
  },
  pet_groomer: {
    hero: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop',
  },
  lawyer: {
    hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop',
  },
  accounting: {
    hero: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=500&fit=crop',
  },
  real_estate: {
    hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=500&fit=crop',
  },
  insurance: {
    hero: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=400&h=500&fit=crop',
  },
  barber: {
    hero: 'https://images.unsplash.com/photo-1503951914875-452862f694a6?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1521590832167-7228f0757c24?w=400&h=500&fit=crop',
  },
  hair_salon: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop',
  },
  nail_salon: {
    hero: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400&h=500&fit=crop',
  },
  gym: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop',
  },
  landscaper: {
    hero: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=500&fit=crop',
  },
  photography: {
    hero: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=450&fit=crop',
    about: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&h=500&fit=crop',
  },
}

interface AuditResult {
  category: string
  purpose: 'hero' | 'about'
  url: string
  hasPeople: boolean
  description: string
}

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mediaType: string }> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  return { base64, mediaType: contentType }
}

async function checkImageForPeople(
  url: string,
  category: string,
  purpose: string
): Promise<{ hasPeople: boolean; description: string }> {
  const { base64, mediaType } = await fetchImageAsBase64(url)

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as 'image/jpeg', data: base64 },
          },
          {
            type: 'text',
            text: `Does this image contain any people (including partial body parts like hands, silhouettes, or blurred figures in the background)? Reply with EXACTLY this JSON format and nothing else:
{"has_people": true/false, "description": "brief 10-word-max description of what you see"}`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    return { hasPeople: !!parsed.has_people, description: parsed.description || '' }
  } catch {
    // Fallback: look for explicit true/yes outside of JSON key names
    const lower = cleaned.toLowerCase()
    const hasPeople = /"has_people"\s*:\s*true/.test(lower) || /\byes\b/.test(lower)
    return { hasPeople, description: cleaned.slice(0, 80) }
  }
}

async function main() {
  const categories = Object.entries(CATEGORY_IMAGE_SOURCES)
  const total = categories.length * 2
  console.log(`Auditing ${total} images across ${categories.length} categories...\n`)

  const results: AuditResult[] = []
  let checked = 0

  for (const [category, sources] of categories) {
    for (const [purpose, url] of Object.entries(sources) as ['hero' | 'about', string][]) {
      checked++
      process.stdout.write(`[${checked}/${total}] ${category}/${purpose}... `)

      try {
        const { hasPeople, description } = await checkImageForPeople(url, category, purpose)
        results.push({ category, purpose, url, hasPeople, description })

        if (hasPeople) {
          console.log(`PEOPLE DETECTED - ${description}`)
        } else {
          console.log(`OK - ${description}`)
        }
      } catch (err) {
        console.log(`ERROR - ${err instanceof Error ? err.message : err}`)
        results.push({ category, purpose, url, hasPeople: false, description: `Error: ${err}` })
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500))
    }
  }

  // Summary report
  const withPeople = results.filter(r => r.hasPeople)
  console.log('\n' + '='.repeat(60))
  console.log(`AUDIT COMPLETE: ${withPeople.length} of ${total} images contain people`)
  console.log('='.repeat(60))

  if (withPeople.length > 0) {
    console.log('\nImages that need replacement:')
    console.log('-'.repeat(60))
    for (const r of withPeople) {
      console.log(`  ${r.category}/${r.purpose}: ${r.description}`)
      console.log(`    URL: ${r.url}`)
    }
  }

  if (withPeople.length === 0) {
    console.log('\nAll images are people-free!')
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
