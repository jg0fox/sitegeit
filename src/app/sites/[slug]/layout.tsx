import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteNav } from '@/components/sites/SiteNav'
import { SiteFooter } from '@/components/sites/SiteFooter'

interface Props {
  children: ReactNode
  params: Promise<{ slug: string }>
}

async function getSiteData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: sites } = await supabase
    .from('generated_sites')
    .select('*, businesses(*)')
    .eq('deploy_url', slug)
    .eq('deploy_status', 'live')
    .order('created_at', { ascending: false })
    .limit(1)

  return sites?.[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteData(slug)
  if (!site) return {}

  const business = site.businesses as Record<string, unknown>
  const businessName = (business.name as string) || slug
  const seo = site.seo_meta as {
    homepage_title?: string
    homepage_description?: string
  } | null

  const title = seo?.homepage_title || businessName
  const description = seo?.homepage_description || ''
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
  const pageUrl = `${baseUrl}/sites/${slug}`
  const heroImageUrl = site.hero_image_url as string | null

  const ogImages = heroImageUrl
    ? [{ url: heroImageUrl, width: 1600, height: 900, alt: businessName }]
    : undefined

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: businessName,
      type: 'website',
      locale: 'en_US',
      images: ogImages,
    },
  }
}

export default async function SiteLayout({ children, params }: Props) {
  const { slug } = await params
  const site = await getSiteData(slug)

  if (!site) {
    notFound()
  }

  const themeConfig = site.theme_config as {
    cssVars?: Record<string, string>
    typography?: { headingFont?: string; bodyFont?: string }
  }
  const cssVars = themeConfig?.cssVars || {}

  // Build Google Fonts URL from theme fonts
  const headingFont = themeConfig?.typography?.headingFont?.split("'")[1]
  const bodyFont = themeConfig?.typography?.bodyFont?.split("'")[1]
  const fonts = [headingFont, bodyFont].filter(Boolean)
  const fontsUrl = fonts.length > 0
    ? `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${encodeURIComponent(f!)}:wght@400;500;600;700;800`).join('&')}&display=swap`
    : null

  // Extract data for SiteNav
  const business = site.businesses as Record<string, unknown>
  const globalContent = (site.homepage_content as Record<string, unknown>)?.global as {
    phone_display?: string
    phone_tel?: string
    nav_labels?: { services?: string; faq?: string }
  } | undefined
  const servicePages = (site.service_pages || []) as { slug: string; h1: string }[]
  const navServices = servicePages.map(sp => ({
    name: sp.h1.replace(/\s+in\s+.*$/, '') || sp.h1,
    slug: sp.slug,
  }))

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      </head>
      <body style={cssVars as React.CSSProperties}>
        {/* Skip-nav for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Skip to main content
        </a>
        <style dangerouslySetInnerHTML={{ __html: [
          '@media (prefers-reduced-motion: reduce) {',
          '  *, *::before, *::after {',
          '    animation-duration: 0.01ms !important;',
          '    animation-iteration-count: 1 !important;',
          '    transition-duration: 0.01ms !important;',
          '    scroll-behavior: auto !important;',
          '  }',
          '}',
          ':focus-visible {',
          '  outline: 2px solid var(--color-primary);',
          '  outline-offset: 2px;',
          '}',
          'a:focus:not(:focus-visible),',
          'button:focus:not(:focus-visible) {',
          '  outline: none;',
          '}',
        ].join('\n') }} />
        <div
          className="min-h-screen flex flex-col"
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <SiteNav
            businessName={business.name as string}
            phone={globalContent?.phone_display || (business.phone as string)}
            phoneTel={globalContent?.phone_tel || (business.phone as string)}
            services={navServices}
            siteSlug={slug}
            navLabels={globalContent?.nav_labels}
          />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <SiteFooter
            businessName={business.name as string}
            phone={globalContent?.phone_display || (business.phone as string)}
            address={[business.address_street, business.address_city, business.address_state, business.address_zip]
              .filter(Boolean)
              .join(', ') as string}
            hours={business.hours as Record<string, string> | null}
            siteSlug={slug}
          />
        </div>
      </body>
    </html>
  )
}
