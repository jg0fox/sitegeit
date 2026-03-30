import { headers } from 'next/headers'

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'goget.im'

/**
 * Compute the base path for internal site links.
 * When accessed via subdomain/custom domain, returns '' (root-relative).
 * When accessed via the main app URL, returns '/sites/{slug}'.
 * Server components only (uses next/headers).
 */
export async function getBasePath(slug: string): Promise<string> {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const domain = SITE_DOMAIN.trim()

  const isMainApp =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.endsWith('.vercel.app') ||
    host === domain ||
    host === `app.${domain}` ||
    host === `www.${domain}`

  return isMainApp ? `/sites/${slug}` : ''
}
