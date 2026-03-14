import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LandingHero } from '@/components/sites/LandingHero'
import { LandingSitePreview } from '@/components/sites/LandingSitePreview'
import { LandingScheduleCall } from '@/components/sites/LandingScheduleCall'
import { LandingCostComparison } from '@/components/sites/LandingCostComparison'
import { LandingPricingTable } from '@/components/sites/LandingPricingTable'
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

  const { data: landingPages } = await supabase
    .from('landing_pages')
    .select('*, businesses(*), generated_sites(*)')
    .eq('deploy_url', slug)
    .eq('deploy_status', 'live')
    .order('created_at', { ascending: false })
    .limit(1)

  return landingPages?.[0] ?? null
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

  const business = landing.businesses as { id: string; name: string } | null

  // Always use the built-in booking page, overriding any stored URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
  const bookingUrl = business?.id
    ? `${appUrl}/book?ref=${business.id}`
    : `${appUrl}/book`

  return (
    <div
      className="min-h-screen bg-white text-slate-900"
      style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
    >
      <LandingHero
        headline={content.headline}
        subheadline={content.subheadline}
        businessName={business?.name || slug}
        bookingUrl={bookingUrl}
      />

      <LandingSitePreview
        intro={content.site_preview_section.intro}
        siteUrl={content.site_preview_section.site_url}
        screenshotAlt={content.site_preview_section.screenshot_alt}
        landingSlug={slug}
      />

      {/* Schedule a call — high placement for engagement */}
      <LandingScheduleCall
        businessName={business?.name || slug}
        buttonUrl={bookingUrl}
      />

      {/* Strategy section — WhyWeBuild style */}
      <section className="bg-slate-50" style={{ padding: 'clamp(3rem, 2rem + 5vw, 5rem) 0' }}>
        <div className="mx-auto" style={{ maxWidth: '720px', padding: '0 clamp(1rem, 0.5rem + 2vw, 2rem)' }}>
          <h2
            className="mb-10 text-center font-bold text-slate-900"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.9rem, 1.5rem + 2vw, 2.25rem)',
              lineHeight: 1.15,
            }}
          >
            {content.strategy_section.heading}
          </h2>
          <div className="flex flex-col gap-8">
            {content.strategy_section.points.map((point, i) => (
              <div key={i} className="flex items-start gap-5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 'clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem)',
                    fontWeight: 600,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3
                    className="font-semibold text-slate-900"
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: 'clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem)',
                    }}
                  >
                    {point.title}
                  </h3>
                  <p
                    className="mt-1 text-slate-600"
                    style={{ lineHeight: 1.65 }}
                  >
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost comparison */}
      <LandingCostComparison />

      {/* Pricing cards + comparison table */}
      <LandingPricingTable slug={slug} />

      <LandingCTA
        heading={content.cta_section.heading}
        body={content.cta_section.body}
        buttonLabel={content.cta_section.button_label}
        buttonUrl={bookingUrl}
      />

      {/* Footer */}
      <footer
        className="border-t border-slate-200"
        style={{ padding: 'clamp(1.5rem, 1rem + 2vw, 2rem) 0' }}
      >
        <div
          className="mx-auto flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between"
          style={{ maxWidth: '1120px', padding: '0 clamp(1rem, 0.5rem + 2vw, 2rem)' }}
        >
          <span
            className="font-bold text-slate-900"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem)',
            }}
          >
            Simple Instant Sites
          </span>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a href="#pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
              Pricing
            </a>
            <a href="#site-preview" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
              Your Site
            </a>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Book a Call
            </a>
          </nav>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Simple Instant Sites
          </p>
        </div>
      </footer>
    </div>
  )
}
