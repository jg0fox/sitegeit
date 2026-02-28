import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/sites/SiteHeader'
import { SiteHero } from '@/components/sites/SiteHero'
import { SiteServices } from '@/components/sites/SiteServices'
import { SiteTestimonials } from '@/components/sites/SiteTestimonials'
import { SiteAbout } from '@/components/sites/SiteAbout'
import { SiteCTA } from '@/components/sites/SiteCTA'
import { SiteFooter } from '@/components/sites/SiteFooter'

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

export default async function SitePage({ params }: Props) {
  const { slug } = await params
  const site = await getSiteData(slug)

  if (!site) {
    notFound()
  }

  const business = site.businesses as Record<string, unknown>
  const homepage = site.homepage_content as {
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
      rating_display: { source: string; rating: number; count: number }
      featured_testimonials: { quote: string; reviewer_name: string; source: string }[]
    }
    about_snippet: {
      heading: string
      body: string
      owner_name: string | null
    }
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

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <SiteHeader
        businessName={business.name as string}
        phone={globalContent?.phone_display || (business.phone as string)}
        phoneTel={globalContent?.phone_tel || (business.phone as string)}
      />

      <main>
        <SiteHero
          headline={homepage.hero.headline}
          subheadline={homepage.hero.subheadline}
          primaryCta={homepage.hero.primary_cta}
          secondaryCta={homepage.hero.secondary_cta}
          phoneTel={globalContent?.phone_tel || (business.phone as string)}
        />

        <SiteServices
          heading={homepage.services_section.heading}
          services={homepage.services_section.services}
        />

        <SiteTestimonials
          ratingDisplay={homepage.social_proof.rating_display}
          testimonials={homepage.social_proof.featured_testimonials}
        />

        <SiteAbout
          heading={homepage.about_snippet.heading}
          body={homepage.about_snippet.body}
          ownerName={homepage.about_snippet.owner_name}
        />

        <SiteCTA
          heading={homepage.cta_section.heading}
          body={homepage.cta_section.body}
          cta={homepage.cta_section.primary_cta}
          phoneTel={globalContent?.phone_tel || (business.phone as string)}
        />
      </main>

      <SiteFooter
        businessName={business.name as string}
        phone={globalContent?.phone_display || (business.phone as string)}
        address={[business.address_street, business.address_city, business.address_state, business.address_zip]
          .filter(Boolean)
          .join(', ') as string}
        hours={business.hours as Record<string, string> | null}
      />

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
    </div>
  )
}
