import { SiteBreadcrumb } from './SiteBreadcrumb'

interface SiteServiceHeroProps {
  h1: string
  opening: string
  cta: { label: string; type: string }
  phoneTel: string | null
  breadcrumbs: { label: string; href?: string }[]
  siteSlug: string
}

export function SiteServiceHero({
  h1,
  opening,
  cta,
  phoneTel,
  breadcrumbs,
  siteSlug,
}: SiteServiceHeroProps) {
  function getCtaHref(type: string) {
    if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
    if (type === 'form') return '#contact'
    return '#services'
  }

  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 5rem)',
        paddingBottom: 'var(--space-section, 5rem)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <div className="mb-6">
          <SiteBreadcrumb items={breadcrumbs} siteSlug={siteSlug} />
        </div>

        <div className="max-w-2xl">
          <h1
            className="mb-4 text-3xl sm:text-4xl md:text-5xl"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading, 700)',
              letterSpacing: 'var(--tracking-heading, -0.02em)',
              lineHeight: 1.15,
            }}
          >
            {h1}
          </h1>

          <p
            className="mb-8 text-lg leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {opening}
          </p>

          <a
            href={getCtaHref(cta.type)}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-button)',
            }}
          >
            {cta.label}
          </a>
        </div>
      </div>
    </section>
  )
}
