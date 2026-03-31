import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

const SITE_DOMAIN = (process.env.NEXT_PUBLIC_SITE_DOMAIN || 'goget.im').trim()

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Check for landing page subdomain (go.goget.im/slug/...) — must be before general subdomain check
  if (hostname === `go.${SITE_DOMAIN}`) {
    // Rewrite full path under /sites/go/ (e.g., /electric-force-inc/checkout → /sites/go/electric-force-inc/checkout)
    if (pathname && pathname !== '/') {
      const url = request.nextUrl.clone()
      url.pathname = `/sites/go${pathname}`
      return NextResponse.rewrite(url)
    }
    return updateSession(request)
  }

  // Check for client site subdomains (e.g., joes-plumbing.goget.im)
  if (hostname.endsWith(`.${SITE_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${SITE_DOMAIN}`, '')

    // Skip known app subdomains
    if (['app', 'www', 'api'].includes(subdomain)) {
      return updateSession(request)
    }

    // Let API routes pass through without rewriting (e.g., contact form, booking API)
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // Rewrite to the client site renderer
    const url = request.nextUrl.clone()
    url.pathname = `/sites/${subdomain}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // Check for custom domain routing (non-goget.im hostnames)
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isVercelPreview = hostname.endsWith('.vercel.app')
  const isSiteDomain = hostname === SITE_DOMAIN || hostname.endsWith(`.${SITE_DOMAIN}`)

  if (!isLocalhost && !isVercelPreview && !isSiteDomain) {
    // Look up custom domain in generated_sites
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    )

    const { data: site } = await supabase
      .from('generated_sites')
      .select('deploy_url')
      .eq('custom_domain', hostname.replace(/^www\./, ''))
      .eq('deploy_status', 'live')
      .limit(1)
      .single()

    if (site?.deploy_url) {
      const url = request.nextUrl.clone()
      url.pathname = `/sites/${site.deploy_url}${pathname === '/' ? '' : pathname}`
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
