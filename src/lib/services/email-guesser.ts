import dns from 'dns/promises'

/**
 * Tier 2 email finding: pattern guessing + MX record verification.
 * Generates common email patterns for a business domain and verifies
 * that the domain has MX records (accepts email).
 * No SMTP verification (not possible on Vercel serverless).
 */

const COMMON_PREFIXES = ['info', 'contact', 'hello', 'admin', 'office']

/**
 * Check if a domain has MX records (can receive email).
 */
async function hasMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(domain)
    return records.length > 0
  } catch {
    return false
  }
}

/**
 * Extract the root domain from a website URL.
 * e.g., "https://www.joesplumbing.com/about" -> "joesplumbing.com"
 */
function extractDomain(websiteUrl: string): string | null {
  try {
    const url = new URL(
      websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
    )
    return url.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Generate first-name-based email candidates from an owner name.
 * e.g., "Joe Smith" -> ["joe@", "joe.smith@", "jsmith@"]
 */
function ownerNameCandidates(ownerName: string): string[] {
  const parts = ownerName.trim().toLowerCase().split(/\s+/)
  if (parts.length === 0) return []

  const first = parts[0]
  const candidates = [first]

  if (parts.length >= 2) {
    const last = parts[parts.length - 1]
    candidates.push(`${first}.${last}`)
    candidates.push(`${first[0]}${last}`)
  }

  return candidates
}

export interface GuessedEmail {
  email: string
  method: 'mx_pattern'
  pattern: string // which pattern matched, e.g. 'info@' or 'joe@'
}

/**
 * Attempt to guess a business email address.
 * Returns the best candidate with MX confirmation, or null.
 */
export async function guessBusinessEmail(
  websiteUrl: string,
  ownerName?: string | null
): Promise<GuessedEmail | null> {
  const domain = extractDomain(websiteUrl)
  if (!domain) return null

  // Check MX records first — if domain doesn't accept email, skip
  const hasMx = await hasMxRecords(domain)
  if (!hasMx) return null

  // Build candidate list: common prefixes + owner name variants
  const prefixes = [...COMMON_PREFIXES]
  if (ownerName) {
    prefixes.push(...ownerNameCandidates(ownerName))
  }

  // Return first candidate (info@ is the most common for businesses)
  // Since we can't SMTP verify, we rank by likelihood
  const bestPrefix = prefixes[0] // 'info' by default
  return {
    email: `${bestPrefix}@${domain}`,
    method: 'mx_pattern',
    pattern: `${bestPrefix}@`,
  }
}
