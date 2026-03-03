import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { SiteHero } from '@/components/sites/SiteHero'
import { SiteServices } from '@/components/sites/SiteServices'
import { SiteTestimonials } from '@/components/sites/SiteTestimonials'
import { SiteAbout } from '@/components/sites/SiteAbout'
import { SiteCTA } from '@/components/sites/SiteCTA'
import { SiteTrustBar } from '@/components/sites/SiteTrustBar'
import type { ReactNode } from 'react'

interface Props {
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

// Default section order for pre-Sprint 2 sites without section_order
const FALLBACK_SECTION_ORDER = ['hero', 'services', 'social_proof', 'about', 'cta']

export default async function SitePage({ params }: Props) {
  const { slug } = await params
  const site = await getSiteData(slug)

  if (!site) {
    notFound()
  }

  const business = site.businesses as Record<string, unknown>
  const homepage = site.homepage_content as {
    section_order?: string[]
    hero: {
      headline: string
      subheadline: string
      primary_cta: { label: string; type: string }
      secondary_cta: { label: string; type: string }
    }
    services_section: {
      heading: string
      services: { name: string; description: string; icon_suggestion: string }[]
    }
    social_proof: {
      rating_display: { source: string; rating: number; count: number } | null
      featured_testimonials: { quote: string; reviewer_name: string; source: string }[]
    }
    trust_bar: {
      items: { icon: string; text: string; source: 'verified' | 'inferred' | 'default' }[]
    } | null
    about_snippet: {
      heading: string
      body: string
      owner_name: string | null
    } | null
    cta_section: {
      heading: string
      body: string
      primary_cta: { label: string; type: string }
    }
  }
  const globalContent = (site.homepage_content as Record<string, unknown>)?.global as {
    phone_display?: string
    phone_tel?: string
  } | undefined
  const seo = site.seo_meta as { schema_type?: string; schema_data?: Record<string, unknown> } | null
  const phoneTel = globalContent?.phone_tel || (business.phone as string)

  // Data-driven section ordering — use section_order from AI output, or fallback for legacy sites
  const sectionOrder = homepage.section_order || FALLBACK_SECTION_ORDER

  // Map section keys to rendered components
  const sectionMap: Record<string, ReactNode> = {
    hero: (
      <SiteHero
        key="hero"
        headline={homepage.hero.headline}
        subheadline={homepage.hero.subheadline}
        primaryCta={homepage.hero.primary_cta}
        secondaryCta={homepage.hero.secondary_cta}
        phoneTel={phoneTel}
      />
    ),
    trust_bar: homepage.trust_bar ? (
      <SiteTrustBar
        key="trust_bar"
        items={homepage.trust_bar.items}
      />
    ) : null,
    services: (
      <SiteServices
        key="services"
        heading={homepage.services_section.heading}
        services={homepage.services_section.services}
        siteSlug={slug}
      />
    ),
    social_proof: (
      <SiteTestimonials
        key="social_proof"
        ratingDisplay={homepage.social_proof?.rating_display ?? null}
        testimonials={homepage.social_proof?.featured_testimonials ?? []}
      />
    ),
    about: homepage.about_snippet ? (
      <SiteAbout
        key="about"
        heading={homepage.about_snippet.heading}
        body={homepage.about_snippet.body}
        ownerName={homepage.about_snippet.owner_name}
      />
    ) : null,
    cta: (
      <SiteCTA
        key="cta"
        heading={homepage.cta_section.heading}
        body={homepage.cta_section.body}
        cta={homepage.cta_section.primary_cta}
        phoneTel={phoneTel}
      />
    ),
  }

  return (
    <>
      <main>
        {sectionOrder.map(key => sectionMap[key]).filter(Boolean)}
      </main>

      {/* Schema.org markup */}
      {seo?.schema_data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': seo.schema_type || 'LocalBusiness',
              ...seo.schema_data,
            }),
          }}
        />
      )}
    </>
  )
}
