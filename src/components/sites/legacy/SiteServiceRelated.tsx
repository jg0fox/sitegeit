import type { CSSProperties } from 'react'

interface SiteServiceRelatedProps {
  services: { name: string; slug: string }[]
  basePath: string
  cardVariant?: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
}

function getCardStyle(variant: string): CSSProperties {
  const base: CSSProperties = { borderRadius: 'var(--radius-card)' }
  switch (variant) {
    case 'flat':
      return { ...base, backgroundColor: 'transparent' }
    case 'accent-top':
      return {
        ...base,
        backgroundColor: 'var(--color-surface)',
        borderTop: '3px solid var(--color-accent)',
        borderLeft: '1px solid var(--color-border)',
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }
    case 'accent-left':
      return {
        ...base,
        backgroundColor: 'var(--color-surface)',
        borderLeft: '3px solid var(--color-accent)',
        borderTop: '1px solid var(--color-border)',
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }
    default:
      return {
        ...base,
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }
  }
}

export function SiteServiceRelated({
  services,
  basePath,
  cardVariant = 'bordered',
}: SiteServiceRelatedProps) {
  if (services.length === 0) return null

  const cardStyle = getCardStyle(cardVariant)

  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 6rem)',
        paddingBottom: 'var(--space-section, 6rem)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <h2
          className="mb-10 text-center"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            letterSpacing: 'var(--tracking-heading, -0.01em)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          }}
        >
          Related Services
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <a
              key={service.slug}
              href={`${basePath}/${service.slug}`}
              className="group flex items-center justify-between p-5 transition-shadow hover:shadow-md"
              style={cardStyle}
            >
              <span
                className="text-sm font-medium sm:text-base"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {service.name}
              </span>
              <span
                className="material-symbols-outlined transition-transform group-hover:translate-x-0.5"
                style={{ fontSize: '20px', color: 'var(--color-accent, var(--color-primary))' }}
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
