import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteBreadcrumb } from '@/components/sites/SiteBreadcrumb'
import { ContactForm } from '@/components/sites/ContactForm'
import { getBasePath } from '@/lib/utils/site-urls.server'

interface ContactContent {
  h1: string
  phone: string
  address: string
  hours: Record<string, string>
  form_fields: string[]
  response_expectation: string
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  phone: 'Phone Number',
  email: 'Email Address',
  message: 'Message',
  preferred_contact: 'Preferred Contact Method',
  details: 'Details',
  comment: 'Comment',
  company: 'Company',
  service: 'Service Needed',
}

function formatFieldLabel(field: string): string {
  const lower = field.toLowerCase().trim()
  if (FIELD_LABELS[lower]) return FIELD_LABELS[lower]
  return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function sortHours(hours: Record<string, string>): [string, string][] {
  return Object.entries(hours).sort(([a], [b]) => {
    const ai = DAY_ORDER.indexOf(a.toLowerCase())
    const bi = DAY_ORDER.indexOf(b.toLowerCase())
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
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
  const state = (business.address_state as string) || ''

  const title = `Contact ${businessName} | ${city}, ${state}`.trim()
  const description = `Get in touch with ${businessName} in ${city}, ${state}. Call, visit, or send a message.`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
  const pageUrl = `${baseUrl}/sites/${slug}/contact`

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

export default async function ContactPage({ params }: Props) {
  const { slug } = await params
  const [site, basePath] = await Promise.all([getSiteData(slug), getBasePath(slug)])

  if (!site) {
    notFound()
  }

  const contact = site.contact_content as ContactContent | null
  const isEditorial = (site.theme_config as { designSystem?: string } | null)?.designSystem === 'editorial'

  if (!contact) {
    notFound()
  }

  const mapsQuery = encodeURIComponent(contact.address)

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
            className="mx-auto"
            style={{ maxWidth: 'var(--container-max-width, 1200px)' }}
          >
            <div className="mb-8">
              <SiteBreadcrumb
                items={[{ label: 'Contact' }]}
                basePath={basePath}
                isEditorial={isEditorial}
              />
            </div>

            <h1
              className="mb-10 text-3xl sm:text-4xl"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--font-weight-heading, 700)',
                letterSpacing: 'var(--tracking-heading, -0.02em)',
              }}
            >
              {contact.h1}
            </h1>

            <div className="grid gap-10 lg:grid-cols-2">
              {/* Left column: Contact info */}
              <div className="space-y-8">
                {/* Phone */}
                <div>
                  <h2
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Phone
                  </h2>
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-2 text-lg font-medium transition-colors hover:underline"
                    style={{ color: 'var(--color-link, var(--color-primary))' }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '20px' }}
                    >
                      phone
                    </span>
                    {contact.phone}
                  </a>
                </div>

                {/* Address */}
                <div>
                  <h2
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Address
                  </h2>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 transition-colors hover:underline"
                    style={{ color: 'var(--color-link, var(--color-primary))' }}
                  >
                    <span
                      className="material-symbols-outlined mt-0.5 shrink-0"
                      style={{ fontSize: '20px' }}
                    >
                      location_on
                    </span>
                    <span>{contact.address}</span>
                  </a>
                </div>

                {/* Hours */}
                {Object.keys(contact.hours).length > 0 && (
                  <div>
                    <h2
                      className="mb-3 text-sm font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Hours
                    </h2>
                    <dl className="space-y-2 text-sm">
                      {sortHours(contact.hours).map(([day, time]) => (
                        <div key={day} className="flex justify-between gap-4">
                          <dt
                            className="font-medium capitalize"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {day}
                          </dt>
                          <dd style={{ color: 'var(--color-text-secondary)' }}>
                            {time}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>

              {/* Right column: Contact form */}
              <div
                className="border p-6 sm:p-8"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                <ContactForm
                  businessId={site.businesses.id}
                  formFields={contact.form_fields}
                  responseExpectation={contact.response_expectation}
                />
              </div>
            </div>
          </div>
        </section>
    </main>
  )
}
