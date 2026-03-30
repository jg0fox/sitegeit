import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteServiceHero } from '@/components/sites/SiteServiceHero'
import { SiteServiceDetails } from '@/components/sites/SiteServiceDetails'
import { SiteServiceWhy } from '@/components/sites/SiteServiceWhy'
import { SiteServiceRelated } from '@/components/sites/SiteServiceRelated'
import { SiteSectionDivider } from '@/components/sites/SiteSectionDivider'
import { buildServiceSchema } from '@/lib/utils/schema-org'
import { getBasePath } from '@/lib/utils/site-urls.server'
import { getBookingSlug } from '@/lib/services/booking-config'
import { getBookingUrl } from '@/lib/utils/site-urls'

interface ServicePage {
  slug: string
  h1: string
  opening: string
  whats_involved: string[]
  why_this_business: string[]
  pricing: string | null
  cta: { label: string; type: string }
}

interface Props {
  params: Promise<{ slug: string; 'service-slug': string }>
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
  const { slug, 'service-slug': serviceSlug } = await params
  const site = await getSiteData(slug)
  if (!site) return {}

  const servicePages = (site.service_pages ?? []) as ServicePage[]
  const service = servicePages.find((s) => s.slug === serviceSlug)
  if (!service) return {}

  const business = site.businesses as Record<string, unknown>
  const businessName = business.name as string

  const title = `${service.h1} | ${businessName}`.slice(0, 60)
  const description = service.opening.slice(0, 160)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
  const pageUrl = `${baseUrl}/sites/${slug}/${serviceSlug}`

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
    },
  }
}

export default async function ServicePageRoute({ params }: Props) {
  const { slug, 'service-slug': serviceSlug } = await params
  const [site, basePath] = await Promise.all([getSiteData(slug), getBasePath(slug)])
  const businessId = site ? ((site.businesses as Record<string, unknown>).id as string) : null
  const bookingSlug = businessId ? await getBookingSlug(businessId) : null
  const bookingUrl = bookingSlug ? getBookingUrl(bookingSlug) : null

  if (!site) {
    notFound()
  }

  const servicePages = (site.service_pages ?? []) as ServicePage[]
  const service = servicePages.find((s) => s.slug === serviceSlug)

  if (!service) {
    notFound()
  }

  const business = site.businesses as Record<string, unknown>
  const globalContent = (site.homepage_content as Record<string, unknown>)?.global as {
    phone_display?: string
    phone_tel?: string
  } | undefined
  const phone = globalContent?.phone_tel || (business.phone as string) || null

  // Extract component variants
  const themeConfig = site.theme_config as {
    designSystem?: 'editorial'
    componentVariants?: {
      card: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
      heroBackground: 'solid' | 'gradient' | 'pattern'
      sectionDivider: 'none' | 'angled' | 'curved' | 'line'
      iconStyle: 'bare' | 'circle-bg' | 'square-bg'
    }
  } | null
  const isEditorial = themeConfig?.designSystem === 'editorial'
  const variants = themeConfig?.componentVariants
  const cardVariant = variants?.card || 'bordered'
  const heroBackground = variants?.heroBackground || 'solid'
  const sectionDivider = variants?.sectionDivider || 'none'
  const iconStyle = variants?.iconStyle || 'bare'

  const relatedServices = servicePages
    .filter((s) => s.slug !== serviceSlug)
    .slice(0, 3)

  return (
    <>
    <main>
        <SiteServiceHero
          h1={service.h1}
          opening={service.opening}
          cta={service.cta}
          phoneTel={phone}
          bookingUrl={bookingUrl}
          breadcrumbs={[
            { label: 'Services', href: `${basePath}#services` },
            { label: service.h1 },
          ]}
          basePath={basePath}
          heroBackground={heroBackground}
          isEditorial={isEditorial}
        />

        <SiteSectionDivider variant={sectionDivider} isEditorial={isEditorial} />

        <SiteServiceDetails
          items={service.whats_involved}
          cardVariant={cardVariant}
          iconStyle={iconStyle}
        />

        {service.pricing && (
          <>
            <SiteSectionDivider variant={sectionDivider} isEditorial={isEditorial} />
            <section
              className="px-4"
              style={{
                paddingTop: 'var(--space-section, 6rem)',
                paddingBottom: 'var(--space-section, 6rem)',
                backgroundColor: 'var(--color-section-alternate, var(--color-surface))',
              }}
            >
              <div
                className="mx-auto"
                style={{ maxWidth: 'var(--container-max-width, 1200px)' }}
              >
                <div
                  className="border p-6 sm:p-8"
                  style={{
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    backgroundColor: 'var(--color-primary-light, var(--color-background))',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="material-symbols-outlined mt-0.5"
                      style={{ fontSize: '24px', color: 'var(--color-accent, var(--color-primary))' }}
                    >
                      payments
                    </span>
                    <div>
                      <h2
                        className="mb-2 text-lg font-semibold"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 'var(--font-weight-heading, 700)',
                        }}
                      >
                        Pricing
                      </h2>
                      <p
                        className="leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {service.pricing}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <SiteSectionDivider variant={sectionDivider} isEditorial={isEditorial} />

        <SiteServiceWhy
          items={service.why_this_business}
          businessName={business.name as string}
          cardVariant={cardVariant}
        />

        {relatedServices.length > 0 && (
          <>
            <SiteSectionDivider variant={sectionDivider} isEditorial={isEditorial} />
            <SiteServiceRelated
              services={relatedServices.map((s) => ({ name: s.h1, slug: s.slug }))}
              basePath={basePath}
              cardVariant={cardVariant}
              isEditorial={isEditorial}
            />
          </>
        )}
    </main>

    {/* JSON-LD Service schema */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(buildServiceSchema({
          serviceName: service.h1,
          description: service.opening,
          businessName: business.name as string,
        })),
      }}
    />
    </>
  )
}
