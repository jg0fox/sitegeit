import type { CSSProperties } from 'react'

interface Service {
  name: string
  description: string
  icon_suggestion: string
}

interface SiteServicesProps {
  heading: string
  services: Service[]
  siteSlug?: string
  servicePageSlugs?: Record<string, string>
  cardVariant?: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
  iconStyle?: 'bare' | 'circle-bg' | 'square-bg'
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getCardStyle(variant: string): CSSProperties {
  const base: CSSProperties = {
    borderRadius: 'var(--radius-card)',
    textDecoration: 'none',
    color: 'inherit',
  }
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
    default: // 'bordered'
      return {
        ...base,
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }
  }
}

function renderIcon(iconName: string, style: string) {
  const icon = (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: '28px', color: 'var(--color-primary)' }}
    >
      {iconName}
    </span>
  )

  if (style === 'circle-bg') {
    return (
      <span
        className="mb-3 inline-flex items-center justify-center"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(var(--color-accent-rgb, 163,163,163), 0.15)',
        }}
      >
        {icon}
      </span>
    )
  }

  if (style === 'square-bg') {
    return (
      <span
        className="mb-3 inline-flex items-center justify-center"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-sm, 4px)',
          backgroundColor: 'rgba(var(--color-accent-rgb, 163,163,163), 0.15)',
        }}
      >
        {icon}
      </span>
    )
  }

  // bare
  return (
    <span
      className="material-symbols-outlined mb-3 block"
      style={{ fontSize: '32px', color: 'var(--color-primary)' }}
    >
      {iconName}
    </span>
  )
}

export function SiteServices({
  heading,
  services,
  siteSlug,
  servicePageSlugs,
  cardVariant = 'bordered',
  iconStyle = 'bare',
}: SiteServicesProps) {
  const cardStyle = getCardStyle(cardVariant)

  return (
    <section
      id="services"
      className="px-4"
      style={{ paddingTop: 'var(--space-section, 6rem)', paddingBottom: 'var(--space-section, 6rem)' }}
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
          {heading}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const serviceSlug = servicePageSlugs?.[service.name] ?? toSlug(service.name)
            const href = siteSlug ? `/sites/${siteSlug}/${serviceSlug}` : undefined
            const cardContent = (
              <>
                {renderIcon(service.icon_suggestion, iconStyle)}
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {service.name}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {service.description}
                </p>
                {href && (
                  <span
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: 'var(--color-link, var(--color-primary))' }}
                  >
                    Learn more
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      arrow_forward
                    </span>
                  </span>
                )}
              </>
            )

            return href ? (
              <a
                key={service.name}
                href={href}
                className="block p-8 transition-shadow hover:shadow-md"
                style={cardStyle}
              >
                {cardContent}
              </a>
            ) : (
              <div
                key={service.name}
                className="p-8 transition-shadow hover:shadow-md"
                style={{ ...cardStyle, textDecoration: undefined }}
              >
                {cardContent}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
