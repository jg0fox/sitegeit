/**
 * Web search-based email discovery using Serper.dev + optional LLM extraction.
 * Automates the manual process of Googling "business name email address".
 *
 * Gracefully skips if SERPER_API_KEY is not configured.
 */

import { extractEmailsFromHtml, fetchPage, EMAIL_REGEX } from './web-detection'
import { getAnthropicClient } from '@/lib/ai/client'

const SERPER_API_KEY = process.env.SERPER_API_KEY
const SERPER_URL = 'https://google.serper.dev/search'

export interface EmailSearchCandidate {
  email: string
  source: 'web_search'
  confidence: 'high' | 'medium' | 'low'
  source_url: string | null
  source_context: string | null
}

interface SerperResult {
  title: string
  link: string
  snippet: string
}

interface SerperResponse {
  organic: SerperResult[]
  knowledgeGraph?: {
    description?: string
    attributes?: Record<string, string>
  }
}

/**
 * Build search queries for a business.
 * Mirrors the manual approach: "business name city email"
 */
function buildQueries(business: {
  name: string
  address_city: string | null
  owner_name: string | null
}): string[] {
  const queries: string[] = []
  const city = business.address_city || ''

  // Primary: business name + city + email
  queries.push(`"${business.name}" ${city} email`.trim())

  // Secondary: business name + contact email address
  queries.push(`"${business.name}" contact email address`)

  // If owner name is known, search for that too
  if (business.owner_name) {
    queries.push(`"${business.owner_name}" "${business.name}" email`)
  }

  return queries
}

/**
 * Call Serper.dev Google Search API for a single query.
 */
async function serperSearch(query: string): Promise<SerperResponse | null> {
  if (!SERPER_API_KEY) return null

  try {
    const res = await fetch(SERPER_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: 10 }),
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.error(`[email-search] Serper API error: ${res.status} ${res.statusText}`)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error('[email-search] Serper search failed:', err)
    return null
  }
}

/**
 * Extract emails from search result snippets using regex.
 */
function extractEmailsFromSnippets(
  results: SerperResult[]
): { email: string; source_url: string; source_context: string }[] {
  const found: { email: string; source_url: string; source_context: string }[] = []
  const seen = new Set<string>()

  for (const result of results) {
    const text = `${result.title} ${result.snippet}`
    const matches = text.match(EMAIL_REGEX) || []
    for (const match of matches) {
      const email = match.toLowerCase().trim()
      if (!seen.has(email)) {
        seen.add(email)
        found.push({
          email,
          source_url: result.link,
          source_context: result.snippet.substring(0, 200),
        })
      }
    }
  }

  return found
}

/**
 * Scrape actual pages from top search results for emails.
 * Only fetches the top N pages to stay fast and cheap.
 */
async function scrapeTopResults(
  results: SerperResult[],
  websiteDomain: string | null,
  maxPages = 5
): Promise<{ email: string; source_url: string; source_context: string }[]> {
  const found: { email: string; source_url: string; source_context: string }[] = []
  const seen = new Set<string>()
  const pagesToFetch = results.slice(0, maxPages)

  const pages = await Promise.allSettled(
    pagesToFetch.map(async (result) => {
      const html = await fetchPage(result.link)
      return { html, result }
    })
  )

  for (const outcome of pages) {
    if (outcome.status !== 'fulfilled' || !outcome.value.html) continue
    const { html, result } = outcome.value
    const emails = extractEmailsFromHtml(html, websiteDomain || undefined)
    for (const email of emails) {
      if (!seen.has(email)) {
        seen.add(email)
        found.push({
          email,
          source_url: result.link,
          source_context: `Found on page: ${result.title}`.substring(0, 200),
        })
      }
    }
  }

  return found
}

/**
 * Use Claude Haiku to extract email addresses from text when regex fails.
 * Sends all snippets in a single call to minimize cost (~$0.001).
 */
async function llmExtractEmails(
  snippets: string[]
): Promise<{ email: string; context: string }[]> {
  if (snippets.length === 0) return []

  try {
    const anthropic = getAnthropicClient()
    const combinedText = snippets.join('\n---\n')

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: 'Extract all email addresses from the following text. Return a JSON array of objects with "email" and "context" (a short phrase explaining where it was found). If no emails are found, return an empty array. Only return valid-looking email addresses, not partial or malformed ones.',
      messages: [{ role: 'user', content: combinedText }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') return []

    let jsonText = textBlock.text.trim()
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonText = jsonMatch[1].trim()

    const parsed = JSON.parse(jsonText) as { email: string; context: string }[]
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('[email-search] LLM extraction failed:', err)
    return []
  }
}

/**
 * Extract domain from URL for matching purposes.
 */
function getDomain(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Score confidence based on where the email was found.
 */
function scoreConfidence(
  email: string,
  sourceUrl: string | null,
  businessDomain: string | null
): 'high' | 'medium' | 'low' {
  const emailDomain = email.split('@')[1]

  // Email domain matches business website = high confidence
  if (businessDomain && emailDomain === businessDomain) return 'high'

  // Found on a directory or known business listing site = medium
  if (sourceUrl) {
    const sourceDomain = getDomain(sourceUrl)
    const directoryPatterns = [
      'yelp.com', 'yellowpages.com', 'bbb.org', 'facebook.com',
      'linkedin.com', 'nextdoor.com', 'angieslist.com', 'homeadvisor.com',
      'thumbtack.com', 'manta.com', 'chamberofcommerce.com',
    ]
    if (sourceDomain && directoryPatterns.some((d) => sourceDomain.includes(d))) {
      return 'medium'
    }
  }

  // Generic gmail/yahoo/outlook with business context = medium
  const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com']
  if (freeProviders.includes(emailDomain)) return 'medium'

  return 'low'
}

// Junk email domains/prefixes (mirrors web-detection.ts filters)
const JUNK_EMAIL_DOMAINS = new Set([
  'example.com', 'sentry.io', 'wix.com', 'squarespace.com',
  'wordpress.com', 'wordpress.org', 'w3.org', 'schema.org',
  'google.com', 'googletagmanager.com', 'facebook.com', 'twitter.com',
  'googleapis.com', 'gstatic.com', 'cloudflare.com', 'jsdelivr.net',
  'unpkg.com', 'cdnjs.cloudflare.com', 'sentry-next.wixpress.com',
])

const JUNK_EMAIL_PREFIXES = new Set([
  'noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster',
  'webmaster', 'hostmaster', 'abuse', 'root', 'test', 'null',
])

function isJunkEmail(email: string): boolean {
  const [local, domain] = email.split('@')
  if (!domain) return true
  if (JUNK_EMAIL_DOMAINS.has(domain)) return true
  if (JUNK_EMAIL_PREFIXES.has(local)) return true
  if (email.length > 60) return true
  if ((local.match(/\./g) || []).length > 3) return true
  return false
}

/**
 * Main entry point: search the web for email addresses for a business.
 * Returns deduplicated, scored candidates.
 *
 * Gracefully returns empty array if SERPER_API_KEY is not set.
 */
export async function searchForEmails(business: {
  name: string
  address_city: string | null
  owner_name: string | null
  website_url: string | null
}): Promise<EmailSearchCandidate[]> {
  if (!SERPER_API_KEY) {
    console.log('[email-search] SERPER_API_KEY not set, skipping web search')
    return []
  }

  const businessDomain = business.website_url ? getDomain(business.website_url) : null
  const queries = buildQueries(business)
  const allResults: SerperResult[] = []
  const allSnippets: string[] = []

  // Run search queries
  for (const query of queries) {
    const response = await serperSearch(query)
    if (response?.organic) {
      allResults.push(...response.organic)
      allSnippets.push(...response.organic.map((r) => `${r.title}\n${r.snippet}`))
    }
    // Check knowledge graph for email attributes
    if (response?.knowledgeGraph?.attributes) {
      const attrs = response.knowledgeGraph.attributes
      for (const [key, value] of Object.entries(attrs)) {
        if (key.toLowerCase().includes('email')) {
          allSnippets.push(value)
        }
      }
    }
  }

  if (allResults.length === 0) return []

  // Step 1: Extract emails from snippets via regex
  const snippetEmails = extractEmailsFromSnippets(allResults)

  // Step 2: Scrape top result pages for emails
  const scrapedEmails = await scrapeTopResults(allResults, businessDomain)

  // Step 3: If regex found nothing, try LLM extraction
  let llmEmails: { email: string; source_url: string | null; source_context: string }[] = []
  if (snippetEmails.length === 0 && scrapedEmails.length === 0) {
    const extracted = await llmExtractEmails(allSnippets)
    llmEmails = extracted.map((e) => ({
      email: e.email.toLowerCase().trim(),
      source_url: null,
      source_context: e.context,
    }))
  }

  // Combine and deduplicate
  const candidateMap = new Map<string, EmailSearchCandidate>()

  for (const item of [...snippetEmails, ...scrapedEmails, ...llmEmails]) {
    const email = item.email.toLowerCase().trim()
    if (isJunkEmail(email)) continue
    if (candidateMap.has(email)) continue

    candidateMap.set(email, {
      email,
      source: 'web_search',
      confidence: scoreConfidence(email, item.source_url, businessDomain),
      source_url: item.source_url,
      source_context: item.source_context,
    })
  }

  // Sort by confidence: high > medium > low
  const order = { high: 0, medium: 1, low: 2 }
  const candidates = Array.from(candidateMap.values()).sort(
    (a, b) => order[a.confidence] - order[b.confidence]
  )

  console.log(`[email-search] Found ${candidates.length} candidates for "${business.name}"`)
  return candidates
}
