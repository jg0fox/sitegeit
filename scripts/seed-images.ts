/**
 * Seed category images into the Supabase category-images bucket.
 *
 * Usage:
 *   npx tsx scripts/seed-images.ts
 *
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - sharp package installed (npm install sharp)
 *
 * This script downloads royalty-free placeholder images from Unsplash,
 * converts them to WebP, and uploads to the category-images bucket.
 * Existing files are overwritten (upsert mode).
 */

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET = 'category-images'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * Unsplash source URLs for each category.
 * Using Unsplash Source (source.unsplash.com) for royalty-free images.
 * Format: https://images.unsplash.com/photo-{id}?w={width}&h={height}&fit=crop
 *
 * Hero images: 1600x900 (16:9 landscape)
 * About images: 800x1000 (4:5 portrait)
 */
interface ImageSource {
  hero: string
  about: string
}

const CATEGORY_IMAGE_SOURCES: Record<string, ImageSource> = {
  // Trades
  plumber: {
    hero: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=1000&fit=crop',
  },
  electrician: {
    hero: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?w=800&h=1000&fit=crop',
  },
  hvac: {
    hero: 'https://images.unsplash.com/photo-1631545806609-2f7fd8e60c5a?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=1000&fit=crop',
  },
  roofer: {
    hero: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=1000&fit=crop',
  },
  general_contractor: {
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=1000&fit=crop',
  },
  handyman: {
    hero: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=1000&fit=crop',
  },
  auto_repair: {
    hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=1000&fit=crop',
  },
  towing: {
    hero: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=1000&fit=crop',
  },
  // Food & Hospitality
  bakery: {
    hero: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1556217477-d325251ece38?w=800&h=1000&fit=crop',
  },
  restaurant: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1000&fit=crop',
  },
  cafe: {
    hero: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=1000&fit=crop',
  },
  bar: {
    hero: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=1000&fit=crop',
  },
  florist: {
    hero: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=1000&fit=crop',
  },
  // Health & Wellness
  dentist: {
    hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=1000&fit=crop',
  },
  chiropractor: {
    hero: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1519823551278-64ac92734314?w=800&h=1000&fit=crop',
  },
  veterinarian: {
    hero: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=1000&fit=crop',
  },
  spa: {
    hero: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=1000&fit=crop',
  },
  yoga: {
    hero: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop',
  },
  cleaning: {
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=1000&fit=crop',
  },
  pet_groomer: {
    hero: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=1000&fit=crop',
  },
  // Professional
  lawyer: {
    hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop',
  },
  accounting: {
    hero: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=1000&fit=crop',
  },
  real_estate: {
    hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&h=1000&fit=crop',
  },
  insurance: {
    hero: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=800&h=1000&fit=crop',
  },
  // Lifestyle
  barber: {
    hero: 'https://images.unsplash.com/photo-1503951914875-452862f694a6?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1521590832167-7228f0757c24?w=800&h=1000&fit=crop',
  },
  hair_salon: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=1000&fit=crop',
  },
  nail_salon: {
    hero: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800&h=1000&fit=crop',
  },
  gym: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop',
  },
  // Creative
  landscaper: {
    hero: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=1000&fit=crop',
  },
  photography: {
    hero: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&h=900&fit=crop',
    about: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&h=1000&fit=crop',
  },
}

async function downloadAndConvert(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Convert to WebP with quality optimization
  return sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer()
}

async function uploadImage(path: string, data: Buffer): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, data, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (error) {
    throw new Error(`Upload failed for ${path}: ${error.message}`)
  }
}

async function seedCategory(category: string, sources: ImageSource): Promise<void> {
  console.log(`\n📦 Seeding ${category}...`)

  for (const [purpose, url] of Object.entries(sources) as [string, string][]) {
    const path = `${category}/${purpose}.webp`
    try {
      console.log(`  ⬇️  Downloading ${purpose}...`)
      const webpBuffer = await downloadAndConvert(url)
      console.log(`  ⬆️  Uploading ${path} (${Math.round(webpBuffer.length / 1024)}KB)...`)
      await uploadImage(path, webpBuffer)
      console.log(`  ✅ ${path}`)
    } catch (err) {
      console.error(`  ❌ ${path}: ${err instanceof Error ? err.message : err}`)
    }
  }
}

async function main() {
  const categories = Object.keys(CATEGORY_IMAGE_SOURCES)
  console.log(`🖼️  Seeding ${categories.length} categories (${categories.length * 2} images)`)
  console.log(`   Bucket: ${BUCKET}`)
  console.log(`   Supabase: ${SUPABASE_URL}`)

  // Optional: filter to specific categories via CLI arg
  const filterArg = process.argv[2]
  const categoriesToSeed = filterArg
    ? categories.filter(c => c.includes(filterArg))
    : categories

  if (filterArg && categoriesToSeed.length === 0) {
    console.error(`No categories match filter "${filterArg}"`)
    process.exit(1)
  }

  for (const category of categoriesToSeed) {
    await seedCategory(category, CATEGORY_IMAGE_SOURCES[category])
  }

  console.log(`\n🎉 Done! Seeded ${categoriesToSeed.length} categories.`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
