import type { WebsiteStatus } from '@/lib/utils/types'

export interface WebPresenceResult {
  status: WebsiteStatus
  emails: string[]
}

const SOCIAL_PATTERNS = [
  /facebook\.com/i,
  /fb\.com/i,
  /instagram\.com/i,
  /linkedin\.com/i,
  /twitter\.com/i,
  /x\.com/i,
  /tiktok\.com/i,
  /youtube\.com/i,
  /yelp\.com/i,
]

const PARKING_PATTERNS = [
  /godaddy/i,
  /namecheap/i,
  /sedo\.com/i,
  /domain.*for\s*sale/i,
  /this\s*domain/i,
  /buy\s*this\s*domain/i,
  /parked/i,
  /under\s*construction/i,
  /coming\s*soon/i,
  /hugedomains/i,
  /dan\.com/i,
  /afternic/i,
  /domain\s*parking/i,
  /website\s*coming\s*soon/i,
]

// Domains that commonly appear in HTML but are not real business emails
const JUNK_EMAIL_DOMAINS = new Set([
  'example.com',
  'sentry.io',
  'wix.com',
  'squarespace.com',
  'wordpress.com',
  'wordpress.org',
  'w3.org',
  'schema.org',
  'google.com',
  'googletagmanager.com',
  'facebook.com',
  'twitter.com',
  'googleapis.com',
  'gstatic.com',
  'cloudflare.com',
  'jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
])

const JUNK_EMAIL_PREFIXES = new Set([
  'noreply',
  'no-reply',
  'donotreply',
  'mailer-daemon',
  'postmaster',
  'webmaster',
  'hostmaster',
  'abuse',
  'root',
  'test',
  'null',
])

const EMAIL_REGEX = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g

const TIMEOUT_MS = 5000

/**
 * Extract email addresses from HTML content.
 * Prefers mailto: links, then falls back to regex scanning.
 * Filters out junk/false-positive emails.
 */
export function extractEmailsFromHtml(
  html: string,
  websiteDomain?: string
): string[] {
  const found = new Set<string>()

  // 1. Extract from mailto: links (most reliable)
  const mailtoRegex = /href=["']mailto:([^"'?]+)/gi
  let match
  while ((match = mailtoRegex.exec(html)) !== null) {
    found.add(match[1].toLowerCase().trim())
  }

  // 2. Regex scan for email patterns in visible text
  const matches = html.match(EMAIL_REGEX) || []
  for (const m of matches) {
    found.add(m.toLowerCase().trim())
  }

  // 3. Filter out junk
  const filtered = Array.from(found).filter((email) => {
    const [local, domain] = email.split('@')
    if (!domain) return false
    if (JUNK_EMAIL_DOMAINS.has(domain)) return false
    if (JUNK_EMAIL_PREFIXES.has(local)) return false
    // Filter out very long "emails" (usually encoded strings)
    if (email.length > 60) return false
    // Filter out emails with too many dots in local part (tracking pixels etc)
    if ((local.match(/\./g) || []).length > 3) return false
    return true
  })

  // 4. Sort: business-domain emails first (domain matches website)
  if (websiteDomain) {
    const domainClean = websiteDomain.replace(/^www\./, '').toLowerCase()
    filtered.sort((a, b) => {
      const aMatch = a.endsWith(`@${domainClean}`) ? 0 : 1
      const bMatch = b.endsWith(`@${domainClean}`) ? 0 : 1
      return aMatch - bMatch
    })
  }

  return filtered.slice(0, 3)
}

/**
 * Fetch a URL with timeout, returning the body text or null on failure.
 */
async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SitegeitBot/1.0; +https://sitegeit.com)',
      },
    })
    clearTimeout(timeout)
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

/**
 * Extract the domain from a URL string.
 */
function getDomain(url: string): string | undefined {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname
  } catch {
    return undefined
  }
}

export async function detectWebPresence(
  url: string | undefined
): Promise<WebPresenceResult> {
  if (!url || url.trim() === '') {
    return { status: 'none', emails: [] }
  }

  // Check if it's a social media URL
  if (SOCIAL_PATTERNS.some((pattern) => pattern.test(url))) {
    return { status: 'social_only', emails: [] }
  }

  // Normalize the URL
  let normalizedUrl = url
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  const websiteDomain = getDomain(normalizedUrl)

  try {
    const body = await fetchPage(normalizedUrl)

    if (body === null) {
      return { status: 'dead', emails: [] }
    }

    const bodyLower = body.toLowerCase()

    // Check for parking page patterns in the HTML
    if (PARKING_PATTERNS.some((pattern) => pattern.test(body))) {
      return { status: 'parked', emails: [] }
    }

    // Check for minimal content (very short pages are likely placeholders)
    const textContent = body.replace(/<[^>]*>/g, '').trim()
    if (textContent.length < 200) {
      return { status: 'parked', emails: [] }
    }

    // Check for outdated indicators
    let status: WebsiteStatus = 'active'
    const currentYear = new Date().getFullYear()
    const copyrightMatch = bodyLower.match(/©\s*(\d{4})|copyright\s*(\d{4})/)
    if (copyrightMatch) {
      const copyrightYear = parseInt(copyrightMatch[1] || copyrightMatch[2])
      if (currentYear - copyrightYear > 3) {
        status = 'outdated'
      }
    }

    // Extract emails from homepage
    let emails = extractEmailsFromHtml(body, websiteDomain)

    // If no emails found, try /contact and /about pages
    if (emails.length === 0) {
      const base = normalizedUrl.replace(/\/+$/, '')
      const extraPages = [`${base}/contact`, `${base}/about`]
      for (const pageUrl of extraPages) {
        const pageBody = await fetchPage(pageUrl)
        if (pageBody) {
          emails = extractEmailsFromHtml(pageBody, websiteDomain)
          if (emails.length > 0) break
        }
      }
    }

    return { status, emails }
  } catch {
    // Network errors, timeouts, DNS failures — all mean the site is unreachable
    return { status: 'dead', emails: [] }
  }
}

export async function batchDetectWebPresence(
  urls: (string | undefined)[]
): Promise<WebPresenceResult[]> {
  return Promise.all(urls.map(detectWebPresence))
}
