import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectWebPresence } from './web-detection'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('detectWebPresence', () => {
  it('returns "none" for undefined or empty URL', async () => {
    expect(await detectWebPresence(undefined)).toBe('none')
    expect(await detectWebPresence('')).toBe('none')
    expect(await detectWebPresence('  ')).toBe('none')
  })

  it('returns "social_only" for social media URLs', async () => {
    expect(await detectWebPresence('https://facebook.com/mybiz')).toBe('social_only')
    expect(await detectWebPresence('https://www.instagram.com/mybiz')).toBe('social_only')
    expect(await detectWebPresence('https://linkedin.com/company/mybiz')).toBe('social_only')
    expect(await detectWebPresence('https://yelp.com/biz/mybiz')).toBe('social_only')
    expect(await detectWebPresence('https://tiktok.com/@mybiz')).toBe('social_only')
  })

  it('returns "dead" for failed requests', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('DNS failure'))
    expect(await detectWebPresence('https://nonexistent-domain-xyz.com')).toBe('dead')
  })

  it('returns "dead" for non-OK responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Not Found', { status: 404 })
    )
    expect(await detectWebPresence('https://example.com')).toBe('dead')
  })

  it('returns "parked" for parking page content', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        '<html><head><title>Domain For Sale</title></head><body><h1>This domain is for sale on GoDaddy</h1><p>Buy this domain now for $999</p></body></html>',
        { status: 200 }
      )
    )
    expect(await detectWebPresence('https://example.com')).toBe('parked')
  })

  it('returns "parked" for very short page content', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('<html><body>Hi</body></html>', { status: 200 })
    )
    expect(await detectWebPresence('https://example.com')).toBe('parked')
  })

  it('returns "outdated" for pages with old copyright year', async () => {
    const oldYear = new Date().getFullYear() - 5
    const longContent = 'Welcome to our business! We provide great services to our local community. Our team has been serving customers for over twenty years with dedication and professionalism. We offer a wide range of services including repairs, installations, and maintenance for residential and commercial properties throughout the greater metro area.'
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        `<html><head><title>My Business</title></head><body><p>${longContent}</p><footer>© ${oldYear} My Business Inc.</footer></body></html>`,
        { status: 200 }
      )
    )
    expect(await detectWebPresence('https://example.com')).toBe('outdated')
  })

  it('returns "active" for functional websites', async () => {
    const currentYear = new Date().getFullYear()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        `<html><head><title>Joe's Plumbing - Austin TX</title></head><body><h1>Welcome to Joe's Plumbing</h1><p>We provide professional plumbing services in the Austin area. Our licensed team handles everything from routine repairs to complex installations. Call us today for a free estimate!</p><footer>© ${currentYear} Joe's Plumbing</footer></body></html>`,
        { status: 200 }
      )
    )
    expect(await detectWebPresence('https://joesplumbing.com')).toBe('active')
  })

  it('returns "dead" on timeout (abort error)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted', 'AbortError')
    )
    expect(await detectWebPresence('https://slow-site.com')).toBe('dead')
  })

  it('prepends https:// to URLs without protocol', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        '<html><body><p>A functional business website with plenty of content for customers to browse and learn about our amazing services.</p></body></html>',
        { status: 200 }
      )
    )
    await detectWebPresence('example.com')
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com',
      expect.any(Object)
    )
  })
})
