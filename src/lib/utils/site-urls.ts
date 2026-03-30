const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'goget.im'

/** Full external URL for a generated site */
export function getSiteUrl(deployUrl: string, customDomain?: string | null): string {
  if (customDomain) return `https://${customDomain}`
  return `https://${deployUrl}.${SITE_DOMAIN}`
}

/** Display domain for a site (no protocol) */
export function getSiteDisplayDomain(deployUrl: string, customDomain?: string | null): string {
  if (customDomain) return customDomain
  return `${deployUrl}.${SITE_DOMAIN}`
}

/** Full external URL for a landing page */
export function getLandingPageUrl(deployUrl: string): string {
  return `https://go.${SITE_DOMAIN}/${deployUrl}`
}

/** Full external URL for a business booking page */
export function getBookingUrl(bookingSlug: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
  return `${appUrl}/book/${bookingSlug}`
}
