import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteBreadcrumb } from '@/components/sites/SiteBreadcrumb'

interface ContactContent {
  h1: string
  phone: string
  address: string
  hours: Record<string, string>
  form_fields: string[]
  response_expectation: string
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

  return {
    title: `Contact ${businessName} | ${city}, ${state}`.trim(),
  }
}

export default async function ContactPage({ params }: Props) {
  const { slug } = await params
  const site = await getSiteData(slug)

  if (!site) {
    notFound()
  }

  const contact = site.contact_content as ContactContent | null

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
                siteSlug={slug}
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
                    style={{ color: 'var(--color-primary)' }}
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
                    style={{ color: 'var(--color-primary)' }}
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
                      {Object.entries(contact.hours).map(([day, time]) => (
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
                <form className="space-y-5">
                  {contact.form_fields.map((field) => {
                    const fieldId = field.toLowerCase().replace(/\s+/g, '-')
                    const isTextarea =
                      field.toLowerCase().includes('message') ||
                      field.toLowerCase().includes('comment') ||
                      field.toLowerCase().includes('details')

                    return (
                      <div key={field}>
                        <label
                          htmlFor={fieldId}
                          className="mb-1.5 block text-sm font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {field}
                        </label>
                        {isTextarea ? (
                          <textarea
                            id={fieldId}
                            name={fieldId}
                            rows={4}
                            className="w-full border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
                            style={{
                              borderColor: 'var(--color-border)',
                              borderRadius: 'var(--radius-button, 6px)',
                              backgroundColor: 'var(--color-background)',
                              color: 'var(--color-text-primary)',
                            }}
                          />
                        ) : (
                          <input
                            id={fieldId}
                            name={fieldId}
                            type={
                              field.toLowerCase().includes('email')
                                ? 'email'
                                : field.toLowerCase().includes('phone')
                                  ? 'tel'
                                  : 'text'
                            }
                            className="w-full border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
                            style={{
                              borderColor: 'var(--color-border)',
                              borderRadius: 'var(--radius-button, 6px)',
                              backgroundColor: 'var(--color-background)',
                              color: 'var(--color-text-primary)',
                            }}
                          />
                        )}
                      </div>
                    )
                  })}

                  <button
                    type="submit"
                    className="w-full px-6 py-3 text-base font-semibold text-white transition-colors"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      borderRadius: 'var(--radius-button)',
                    }}
                  >
                    Send Your Message
                  </button>

                  <p
                    className="text-center text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {contact.response_expectation}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
    </main>
  )
}
