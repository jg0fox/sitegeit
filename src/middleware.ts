import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'sitegeit.com'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Check for client site subdomains (e.g., joes-plumbing.sitegeit.com)
  if (hostname.endsWith(`.${SITE_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${SITE_DOMAIN}`, '')

    // Skip known app subdomains
    if (['app', 'www', 'go', 'api'].includes(subdomain)) {
      return updateSession(request)
    }

    // Rewrite to the client site renderer
    const url = request.nextUrl.clone()
    url.pathname = `/sites/${subdomain}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // Check for landing page subdomain (go.sitegeit.com/slug)
  if (hostname === `go.${SITE_DOMAIN}`) {
    const slug = pathname.split('/')[1]
    if (slug) {
      const url = request.nextUrl.clone()
      url.pathname = `/sites/go/${slug}`
      return NextResponse.rewrite(url)
    }
  }

  // Default: run session management for dashboard routes
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
