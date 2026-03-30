import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteBreadcrumb } from '@/components/sites/SiteBreadcrumb'
import { getCategoryImageUrls } from '@/lib/images/category-images'
import { getBasePath } from '@/lib/utils/site-urls.server'

interface AboutContent {
  h1: string
  story: string
  team: string | null
  values: string[]
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteData(slug)
  if (!site) return {}

  const business = site.businesses as Record<string, unknown>
  const businessName = business.name as string
  const city = (business.address_city as string) || ''
  const category = (business.category as string) || ''

  const about = site.about_content as { story?: string } | null
  const title = `About ${businessName} | ${city} ${category}`.trim()
  const description = about?.story?.slice(0, 160) || `Learn about ${businessName} in ${city}.`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
  const pageUrl = `${baseUrl}/sites/${slug}/about`

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

export default async function AboutPage({ params }: Props) {
  const { slug } = await params
  const [site, basePath] = await Promise.all([getSiteData(slug), getBasePath(slug)])

  if (!site) {
    notFound()
  }

  const about = site.about_content as AboutContent | null
  const business = site.businesses as Record<string, unknown>
  const isEditorial = (site.theme_config as { designSystem?: string } | null)?.designSystem === 'editorial'
  const categorySlug = (business?.category_slug as string) || (business?.category as string || '').toLowerCase().replace(/\s+/g, '_')
  const aboutImageUrl = (site.about_image_url as string | null) || getCategoryImageUrls(categorySlug)?.aboutUrl || null

  if (!about) {
    notFound()
  }

  return (
    <main>
      <section
          className="px-4"
          style={{
            paddingTop: 'var(--space-section, 5rem)',
            paddingBottom: 'var(--space-section, 5rem)',
          }}
        >
          <div
            className="mx-auto max-w-3xl"
          >
            <div className="mb-8">
              <SiteBreadcrumb
                items={[{ label: 'About' }]}
                basePath={basePath}
                isEditorial={isEditorial}
              />
            </div>

            <h1
              className="mb-8 text-3xl sm:text-4xl"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--font-weight-heading, 700)',
                letterSpacing: 'var(--tracking-heading, -0.02em)',
              }}
            >
              {about.h1}
            </h1>

            <div>
              {/* Float image right on desktop, stack on mobile */}
              {aboutImageUrl && (
                <div className="mb-6 sm:float-right sm:mb-4 sm:ml-8 sm:w-[280px] md:w-[320px]">
                  <img
                    src={aboutImageUrl}
                    alt=""
                    className="w-full rounded-lg"
                    style={{ borderRadius: 'var(--radius-card, 12px)' }}
                  />
                </div>
              )}
              <p
                className="mb-10 text-base leading-relaxed sm:text-lg"
                style={{
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-line',
                }}
              >
                {about.story}
              </p>

              {about.team && (
                <div className="mb-10">
                  <h2
                    className="mb-4 text-xl sm:text-2xl"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 'var(--font-weight-heading, 700)',
                      letterSpacing: 'var(--tracking-heading, -0.01em)',
                    }}
                  >
                    Meet the Team
                  </h2>
                  <p
                    className="leading-relaxed"
                    style={{
                      color: 'var(--color-text-secondary)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {about.team}
                  </p>
                </div>
              )}

              {about.values.length > 0 && (
                <div>
                  <h2
                    className="mb-4 text-xl sm:text-2xl"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 'var(--font-weight-heading, 700)',
                      letterSpacing: 'var(--tracking-heading, -0.01em)',
                    }}
                  >
                    Our Values
                  </h2>
                  <ul className="space-y-3">
                    {about.values.map((value, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="material-symbols-outlined mt-0.5 shrink-0"
                          style={{ fontSize: '20px', color: 'var(--color-primary)' }}
                        >
                          check_circle
                        </span>
                        <span
                          className="leading-relaxed"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
    </main>
  )
}
