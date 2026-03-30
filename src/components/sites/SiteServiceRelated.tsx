import type { CSSProperties } from 'react'

interface SiteServiceRelatedProps {
  services: { name: string; slug: string }[]
  basePath: string
  cardVariant?: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
  isEditorial?: boolean
}

function getCardStyle(variant: string): CSSProperties {
  const base: CSSProperties = { borderRadius: 'var(--radius-card)' }
  switch (variant) {
    case 'flat': return { ...base, backgroundColor: 'transparent' }
    case 'accent-top': return { ...base, backgroundColor: 'var(--color-surface)', borderTop: '3px solid var(--color-accent)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }
    case 'accent-left': return { ...base, backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-accent)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }
    default: return { ...base, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }
  }
}

export function SiteServiceRelated({
  services,
  basePath,
  cardVariant = 'bordered',
  isEditorial,
}: SiteServiceRelatedProps) {
  if (services.length === 0) return null

  // =========================================================
  // Editorial rendering — tonal cards, no borders
  // =========================================================
  if (isEditorial) {
    return (
      <section
        className="px-6 md:px-8"
        style={{
          paddingTop: 'clamp(4rem, 8vw, 6rem)',
          paddingBottom: 'clamp(4rem, 8vw, 6rem)',
          backgroundColor: 'var(--ed-surface-container-low, var(--color-section-alternate))',
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1280px)' }}>
          <h2
            className="mb-10"
            style={{
              fontFamily: 'var(--ed-font-heading, var(--font-heading))',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              color: 'var(--ed-on-surface, var(--color-text-primary))',
            }}
          >
            Related Services
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <a
                key={service.slug}
                href={`${basePath}/${service.slug}`}
                className="group flex items-center justify-between p-5 transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--ed-surface-container-lowest, #ffffff)',
                  borderRadius: 'var(--ed-radius-lg, 2rem)',
                }}
              >
                <span
                  className="text-sm font-medium sm:text-base"
                  style={{ color: 'var(--ed-on-surface, var(--color-text-primary))' }}
                >
                  {service.name}
                </span>
                <span
                  className="material-symbols-outlined transition-transform group-hover:translate-x-1"
                  style={{
                    fontSize: '20px',
                    color: 'var(--ed-primary, var(--color-primary))',
                  }}
                >
                  arrow_forward
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // =========================================================
  // Legacy rendering — unchanged
  // =========================================================
  const cardStyle = getCardStyle(cardVariant)
  return (
    <section className="px-4" style={{ paddingTop: 'var(--space-section, 6rem)', paddingBottom: 'var(--space-section, 6rem)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <h2 className="mb-10 text-center" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading, 700)', letterSpacing: 'var(--tracking-heading, -0.01em)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>Related Services</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <a key={service.slug} href={`${basePath}/${service.slug}`} className="group flex items-center justify-between p-5 transition-shadow hover:shadow-md" style={cardStyle}>
              <span className="text-sm font-medium sm:text-base" style={{ color: 'var(--color-text-primary)' }}>{service.name}</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-0.5" style={{ fontSize: '20px', color: 'var(--color-accent, var(--color-primary))' }}>arrow_forward</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
