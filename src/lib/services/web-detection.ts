import type { WebsiteStatus } from '@/lib/utils/types'

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

const TIMEOUT_MS = 5000

export async function detectWebPresence(
  url: string | undefined
): Promise<WebsiteStatus> {
  if (!url || url.trim() === '') {
    return 'none'
  }

  // Check if it's a social media URL
  if (SOCIAL_PATTERNS.some((pattern) => pattern.test(url))) {
    return 'social_only'
  }

  // Normalize the URL
  let normalizedUrl = url
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(normalizedUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SitegeitBot/1.0; +https://sitegeit.com)',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return 'dead'
    }

    // Read the body to check for parking page indicators
    const body = await response.text()
    const bodyLower = body.toLowerCase()

    // Check for parking page patterns in the HTML
    if (PARKING_PATTERNS.some((pattern) => pattern.test(body))) {
      return 'parked'
    }

    // Check for minimal content (very short pages are likely placeholders)
    // Strip HTML tags and check text content length
    const textContent = body.replace(/<[^>]*>/g, '').trim()
    if (textContent.length < 200) {
      return 'parked'
    }

    // Check for outdated indicators
    const currentYear = new Date().getFullYear()
    const copyrightMatch = bodyLower.match(/©\s*(\d{4})|copyright\s*(\d{4})/)
    if (copyrightMatch) {
      const copyrightYear = parseInt(copyrightMatch[1] || copyrightMatch[2])
      if (currentYear - copyrightYear > 3) {
        return 'outdated'
      }
    }

    // If we got here, the site is functional
    return 'active'
  } catch {
    // Network errors, timeouts, DNS failures — all mean the site is unreachable
    return 'dead'
  }
}

export async function batchDetectWebPresence(
  urls: (string | undefined)[]
): Promise<WebsiteStatus[]> {
  return Promise.all(urls.map(detectWebPresence))
}
