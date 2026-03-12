/**
 * Tier 3 email finding: Hunter.io API wrapper.
 * Only active when HUNTER_API_KEY env var is set.
 * Free plan: 25 lookups/month. Starter ($49/mo): 500.
 */

const HUNTER_API_KEY = process.env.HUNTER_API_KEY
const HUNTER_BASE = 'https://api.hunter.io/v2'

interface HunterEmail {
  value: string
  type: string | null
  confidence: number
  first_name: string | null
  last_name: string | null
}

interface HunterDomainSearchResponse {
  data: {
    domain: string
    disposable: boolean
    webmail: boolean
    accept_all: boolean
    pattern: string | null
    organization: string | null
    emails: HunterEmail[]
  }
  meta: {
    results: number
    limit: number
    offset: number
  }
}

/**
 * Extract domain from a URL for Hunter.io lookup.
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Search Hunter.io for emails associated with a domain.
 * Returns the best email found, or null.
 * Gracefully returns null if HUNTER_API_KEY is not configured.
 */
export async function findEmailByDomain(
  websiteUrl: string,
  companyName?: string | null
): Promise<{ email: string; source: 'hunter'; confidence: number } | null> {
  if (!HUNTER_API_KEY) return null

  const domain = extractDomain(websiteUrl)
  if (!domain) return null

  try {
    const params = new URLSearchParams({
      domain,
      api_key: HUNTER_API_KEY,
    })
    if (companyName) {
      params.set('company', companyName)
    }

    const res = await fetch(`${HUNTER_BASE}/domain-search?${params}`, {
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.error(`Hunter.io API error: ${res.status} ${res.statusText}`)
      return null
    }

    const data: HunterDomainSearchResponse = await res.json()

    if (data.data.emails.length === 0) return null

    // Pick the highest-confidence email
    const best = data.data.emails.reduce((a, b) =>
      b.confidence > a.confidence ? b : a
    )

    return {
      email: best.value,
      source: 'hunter',
      confidence: best.confidence,
    }
  } catch (err) {
    console.error('Hunter.io lookup failed:', err)
    return null
  }
}
