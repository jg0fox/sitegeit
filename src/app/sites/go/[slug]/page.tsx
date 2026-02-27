import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LandingHero } from '@/components/sites/LandingHero'
import { LandingSitePreview } from '@/components/sites/LandingSitePreview'
import { LandingCTA } from '@/components/sites/LandingCTA'

interface Props {
  params: Promise<{ slug: string }>
}

async function getLandingData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: landingPage } = await supabase
    .from('landing_pages')
    .select('*, businesses(*), generated_sites(*)')
    .eq('deploy_url', `go.sitegeit.com/${slug}`)
    .eq('deploy_status', 'live')
    .single()

  return landingPage
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const landing = await getLandingData(slug)
  if (!landing) return {}

  const business = landing.businesses as { name: string } | null

  return {
    title: `${business?.name || slug} — Your New Website is Ready`,
    description: landing.headline,
  }
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params
  const landing = await getLandingData(slug)

  if (!landing) {
    notFound()
  }

  const content = landing.site_preview_data as {
    headline: string
    subheadline: string
    site_preview_section: {
      intro: string
      site_url: string
      screenshot_alt: string
    }
    strategy_section: {
      heading: string
      points: { title: string; description: string }[]
    }
    what_you_get: {
      heading: string
      tiers_preview: { name: string; price: string; highlight: string }[]
    }
    cta_section: {
      heading: string
      body: string
      button_label: string
      button_url: string
    }
  }

  const business = landing.businesses as { name: string } | null

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingHero
        headline={content.headline}
        subheadline={content.subheadline}
        businessName={business?.name || slug}
      />

      <LandingSitePreview
        intro={content.site_preview_section.intro}
        siteUrl={content.site_preview_section.site_url}
        screenshotAlt={content.site_preview_section.screenshot_alt}
      />

      {/* Strategy section */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">{content.strategy_section.heading}</h2>
        <div className="space-y-6">
          {content.strategy_section.points.map((point, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold">{point.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold">{content.what_you_get.heading}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.what_you_get.tiers_preview.map((tier) => (
              <div key={tier.name} className="rounded-lg border border-gray-200 bg-white p-5 text-center">
                <h3 className="font-semibold">{tier.name}</h3>
                <p className="my-2 text-2xl font-bold text-blue-600">{tier.price}</p>
                <p className="text-sm text-gray-600">{tier.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingCTA
        heading={content.cta_section.heading}
        body={content.cta_section.body}
        buttonLabel={content.cta_section.button_label}
        buttonUrl={content.cta_section.button_url}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-500">
        <p>Powered by <a href="https://sitegeit.com" className="text-blue-600">Sitegeit</a></p>
      </footer>
    </div>
  )
}
