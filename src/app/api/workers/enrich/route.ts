import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { publishToWorker } from '@/lib/qstash/client'
import { enrichBusiness } from '@/lib/ai/enrich'
import { getAdminClient } from '@/lib/supabase/admin'
import { guessAllBusinessEmails } from '@/lib/services/email-guesser'
import { findEmailByDomain } from '@/lib/services/hunter'
import { searchForEmails } from '@/lib/services/email-search'
import { extractEmailsFromHtml, fetchPage } from '@/lib/services/web-detection'

interface CandidateRow {
  business_id: string
  email: string
  source: string
  confidence: string
  source_url: string | null
  source_context: string | null
  is_selected: boolean
}

/**
 * After AI enrichment, find ALL email candidates across 4 tiers and store them.
 * Replaces the old single-email findEmail() approach.
 *
 * Tier 1: Website scrape (homepage + /contact + /about)
 * Tier 2: Web search via Serper.dev
 * Tier 3: Pattern guessing + MX verification
 * Tier 4: Hunter.io API
 */
async function findAllEmailCandidates(businessId: string) {
  const supabase = getAdminClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('email, website_url, owner_name, name, address_city, skip_email_search')
    .eq('id', businessId)
    .single()

  if (!business) return
  if (business.skip_email_search) {
    console.log(`[worker/enrich] Email search skipped for ${businessId} (toggle off)`)
    return
  }

  const candidates: CandidateRow[] = []
  const seen = new Set<string>()

  function addCandidate(
    email: string,
    source: string,
    confidence: string,
    sourceUrl: string | null = null,
    sourceContext: string | null = null,
  ) {
    const normalized = email.toLowerCase().trim()
    if (seen.has(normalized)) return
    seen.add(normalized)
    candidates.push({
      business_id: businessId,
      email: normalized,
      source,
      confidence,
      source_url: sourceUrl,
      source_context: sourceContext,
      is_selected: false,
    })
  }

  const websiteUrl = business.website_url

  // Tier 1: Website scrape (deeper scan of business website)
  if (websiteUrl) {
    try {
      const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
      const domain = new URL(normalizedUrl).hostname.replace(/^www\./, '')
      const base = normalizedUrl.replace(/\/+$/, '')

      const pagesToScrape = [normalizedUrl, `${base}/contact`, `${base}/about`, `${base}/contact-us`]
      for (const pageUrl of pagesToScrape) {
        const html = await fetchPage(pageUrl)
        if (html) {
          const emails = extractEmailsFromHtml(html, domain)
          for (const email of emails) {
            addCandidate(email, 'website_scrape', 'high', pageUrl, `Found on ${pageUrl}`)
          }
        }
      }
    } catch (err) {
      console.error(`[worker/enrich] Tier 1 website scrape failed for ${businessId}:`, err)
    }
  }

  // Tier 2: Web search via Serper.dev
  try {
    const searchResults = await searchForEmails({
      name: business.name,
      address_city: business.address_city,
      owner_name: business.owner_name,
      website_url: business.website_url,
    })
    for (const result of searchResults) {
      addCandidate(result.email, 'web_search', result.confidence, result.source_url, result.source_context)
    }
  } catch (err) {
    console.error(`[worker/enrich] Tier 2 web search failed for ${businessId}:`, err)
  }

  // Tier 3: Pattern guessing + MX verification
  if (websiteUrl) {
    try {
      const guessed = await guessAllBusinessEmails(websiteUrl, business.owner_name)
      for (const g of guessed) {
        addCandidate(g.email, 'mx_pattern', 'low', null, `Pattern: ${g.pattern}`)
      }
    } catch (err) {
      console.error(`[worker/enrich] Tier 3 pattern guess failed for ${businessId}:`, err)
    }
  }

  // Tier 4: Hunter.io
  if (websiteUrl) {
    try {
      const hunterResult = await findEmailByDomain(websiteUrl, business.name)
      if (hunterResult) {
        addCandidate(hunterResult.email, 'hunter', 'medium', null, `Hunter.io (${hunterResult.confidence}% confidence)`)
      }
    } catch (err) {
      console.error(`[worker/enrich] Tier 4 Hunter.io failed for ${businessId}:`, err)
    }
  }

  if (candidates.length === 0) {
    console.log(`[worker/enrich] No email candidates found for ${businessId}`)
    return
  }

  // Upsert all candidates (handles re-runs gracefully)
  const { error: upsertError } = await supabase
    .from('email_candidates')
    .upsert(candidates, { onConflict: 'business_id,email', ignoreDuplicates: true })

  if (upsertError) {
    console.error(`[worker/enrich] Failed to upsert email candidates:`, upsertError)
  }

  // Set primary email to highest-confidence candidate if not already set
  if (!business.email) {
    const confidenceOrder = ['high', 'medium', 'low']
    const best = candidates.sort(
      (a, b) => confidenceOrder.indexOf(a.confidence) - confidenceOrder.indexOf(b.confidence)
    )[0]

    if (best) {
      await supabase
        .from('businesses')
        .update({ email: best.email })
        .eq('id', businessId)

      // Also mark the best candidate as selected
      await supabase
        .from('email_candidates')
        .update({ is_selected: true })
        .eq('business_id', businessId)
        .eq('email', best.email)
    }
  }

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: businessId,
    event_type: 'email_search_complete',
    event_data: { candidates_found: candidates.length },
  })

  console.log(`[worker/enrich] Found ${candidates.length} email candidates for ${businessId}`)
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

    // Find all email candidates across 4 tiers
    await findAllEmailCandidates(businessId).catch((err) => {
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
