import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { publishToWorker } from '@/lib/qstash/client'
import { enrichBusiness } from '@/lib/ai/enrich'
import { getAdminClient } from '@/lib/supabase/admin'
import { guessBusinessEmail } from '@/lib/services/email-guesser'
import { findEmailByDomain } from '@/lib/services/hunter'

/**
 * After AI enrichment, attempt to find an email if one isn't already set.
 * Tier 2: pattern guessing + MX verification
 * Tier 3: Hunter.io API (if HUNTER_API_KEY is configured)
 */
async function findEmail(businessId: string) {
  const supabase = getAdminClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('email, website_url, owner_name, name')
    .eq('id', businessId)
    .single()

  if (!business || business.email) return // already has email

  const websiteUrl = business.website_url
  if (!websiteUrl) return // no website to work with

  // Tier 2: Pattern guessing with MX verification
  const guessed = await guessBusinessEmail(websiteUrl, business.owner_name)
  if (guessed) {
    console.log(`[worker/enrich] Tier 2 email guess for ${businessId}: ${guessed.email}`)
    await supabase
      .from('businesses')
      .update({ email: guessed.email })
      .eq('id', businessId)
    return
  }

  // Tier 3: Hunter.io (only if API key is set)
  const hunterResult = await findEmailByDomain(websiteUrl, business.name)
  if (hunterResult) {
    console.log(`[worker/enrich] Tier 3 Hunter.io email for ${businessId}: ${hunterResult.email}`)
    await supabase
      .from('businesses')
      .update({ email: hunterResult.email })
      .eq('id', businessId)
  }
}

async function handler(request: Request) {
  try {
    const data = await request.json()
    const businessId = data.businessId as string

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    console.log(`[worker/enrich] Processing business ${businessId}`)
    const result = await enrichBusiness(businessId)

    // Attempt email finding (Tiers 2/3) if no email yet
    await findEmail(businessId).catch((err) => {
      console.error(`[worker/enrich] Email finding failed for ${businessId}:`, err)
    })

    // Chain: queue site generation
    const messageId = await publishToWorker('generate-site', { businessId })

    console.log(`[worker/enrich] Done. Queued generate-site (${messageId})`)
    return NextResponse.json({
      success: true,
      businessId,
      voiceArchetype: result.voice_archetype,
      nextMessageId: messageId,
    })
  } catch (err) {
    console.error('[worker/enrich] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const POST = process.env.NODE_ENV === 'development'
  ? handler
  : verifySignatureAppRouter(handler)
