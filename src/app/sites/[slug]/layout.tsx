import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

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

  const { data: site } = await supabase
    .from('generated_sites')
    .select('*, businesses(*)')
    .eq('deploy_url', `${slug}.sitegeit.com`)
    .eq('deploy_status', 'live')
    .single()

  return site
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteData(slug)
  if (!site) return {}

  const seo = site.seo_meta as {
    homepage_title?: string
    homepage_description?: string
  } | null

  return {
    title: seo?.homepage_title || site.businesses?.name || slug,
    description: seo?.homepage_description || '',
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

  return (
    <html lang="en">
      <head>
        {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      </head>
      <body style={cssVars as React.CSSProperties}>
        {children}
      </body>
    </html>
  )
}
