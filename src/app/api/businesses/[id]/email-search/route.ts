import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { searchForEmails } from '@/lib/services/email-search'
import { extractEmailsFromHtml, fetchPage } from '@/lib/services/web-detection'
import { guessAllBusinessEmails } from '@/lib/services/email-guesser'
import { findEmailByDomain } from '@/lib/services/hunter'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * POST /api/businesses/[id]/email-search
 * Trigger a manual email search for this business.
 * Runs the full 4-tier pipeline and returns all candidates found.
 */
export async function POST(_request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch business with ownership check
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, website_url, owner_name, address_city')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const adminClient = getAdminClient()

  interface CandidateRow {
    business_id: string
    email: string
    source: string
    confidence: string
    source_url: string | null
    source_context: string | null
    is_selected: boolean
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
      business_id: id,
      email: normalized,
      source,
      confidence,
      source_url: sourceUrl,
      source_context: sourceContext,
      is_selected: false,
    })
  }

  const websiteUrl = business.website_url

  // Tier 1: Website scrape
  if (websiteUrl) {
    try {
      const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
      const domain = new URL(normalizedUrl).hostname.replace(/^www\./, '')
      const base = normalizedUrl.replace(/\/+$/, '')

      for (const pageUrl of [normalizedUrl, `${base}/contact`, `${base}/about`, `${base}/contact-us`]) {
        const html = await fetchPage(pageUrl)
        if (html) {
          const emails = extractEmailsFromHtml(html, domain)
          for (const email of emails) {
            addCandidate(email, 'website_scrape', 'high', pageUrl, `Found on ${pageUrl}`)
          }
        }
      }
    } catch (err) {
      console.error(`[email-search] Tier 1 failed for ${id}:`, err)
    }
  }

  // Tier 2: Web search
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
    console.error(`[email-search] Tier 2 failed for ${id}:`, err)
  }

  // Tier 3: Pattern guessing
  if (websiteUrl) {
    try {
      const guessed = await guessAllBusinessEmails(websiteUrl, business.owner_name)
      for (const g of guessed) {
        addCandidate(g.email, 'mx_pattern', 'low', null, `Pattern: ${g.pattern}`)
      }
    } catch (err) {
      console.error(`[email-search] Tier 3 failed for ${id}:`, err)
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
      console.error(`[email-search] Tier 4 failed for ${id}:`, err)
    }
  }

  // Upsert all candidates
  if (candidates.length > 0) {
    const { error } = await adminClient
      .from('email_candidates')
      .upsert(candidates, { onConflict: 'business_id,email', ignoreDuplicates: true })

    if (error) {
      console.error('[email-search] Failed to upsert candidates:', error)
    }

    // Log activity
    await adminClient.from('activity_log').insert({
      business_id: id,
      user_id: user.id,
      event_type: 'email_search_complete',
      event_data: { candidates_found: candidates.length, manual: true },
    })
  }

  // Return all candidates for this business (including previously found ones)
  const { data: allCandidates } = await supabase
    .from('email_candidates')
    .select('*')
    .eq('business_id', id)
    .order('created_at', { ascending: true })

  const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sorted = (allCandidates || []).sort(
    (a, b) => (order[a.confidence] ?? 3) - (order[b.confidence] ?? 3)
  )

  return NextResponse.json({
    candidates: sorted,
    new_candidates: candidates.length,
  })
}
