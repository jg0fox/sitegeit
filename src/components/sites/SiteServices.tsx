import type { CSSProperties } from 'react'
import { sanitizeIconName } from '@/lib/utils/sanitize-icon'
import { getBentoLayout } from '@/lib/utils/bento-layouts'

interface Service {
  name: string
  description: string
  icon_suggestion: string
}

interface SiteServicesProps {
  heading: string
  services: Service[]
  basePath?: string
  servicePageSlugs?: Record<string, string>
  cardVariant?: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
  iconStyle?: 'bare' | 'circle-bg' | 'square-bg'
  dataSource?: 'verified' | 'inferred' | 'default'
  isEditorial?: boolean
  featuredIndex?: number
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getCardStyle(variant: string): CSSProperties {
  const base: CSSProperties = { borderRadius: 'var(--radius-card)', textDecoration: 'none', color: 'inherit' }
  switch (variant) {
    case 'flat': return { ...base, backgroundColor: 'transparent' }
    case 'accent-top': return { ...base, backgroundColor: 'var(--color-surface)', borderTop: '3px solid var(--color-accent)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }
    case 'accent-left': return { ...base, backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-accent)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }
    default: return { ...base, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }
  }
}

function renderIcon(rawIconName: string, style: string) {
  const iconName = sanitizeIconName(rawIconName)
  const bgIconColor = 'var(--color-accent, var(--color-primary))'
  const iconFallbackBg = 'var(--color-icon-bg, rgba(var(--color-accent-rgb, 163,163,163), 0.35))'
  if (style === 'circle-bg') {
    return (<span className="mb-3 inline-flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: iconFallbackBg }}><span className="material-symbols-outlined" style={{ fontSize: '28px', color: bgIconColor }}>{iconName}</span></span>)
  }
  if (style === 'square-bg') {
    return (<span className="mb-3 inline-flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm, 4px)', backgroundColor: iconFallbackBg }}><span className="material-symbols-outlined" style={{ fontSize: '28px', color: bgIconColor }}>{iconName}</span></span>)
  }
  return (<span className="material-symbols-outlined mb-3 block" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>{iconName}</span>)
}

export function SiteServices({
  heading,
  services,
  basePath,
  servicePageSlugs,
  cardVariant = 'bordered',
  iconStyle = 'bare',
  dataSource,
  isEditorial,
  featuredIndex = 0,
}: SiteServicesProps) {
  // =========================================================
  // Editorial rendering — bento grid with tonal layering
  // =========================================================
  if (isEditorial) {
    const bentoItems = getBentoLayout(services.length, featuredIndex)

    return (
      <section
        id="services"
        className="px-6 md:px-8"
        style={{
          paddingTop: 'clamp(4rem, 8vw, 6rem)',
          paddingBottom: 'clamp(4rem, 8vw, 6rem)',
          backgroundColor: 'var(--ed-surface-container-low, var(--color-section-alternate))',
        }}
        {...(dataSource && { 'data-source': dataSource })}
      >
        <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1280px)' }}>
          {/* Section label + heading */}
          <div className="mb-12">
            <p
              className="mb-3 text-xs font-semibold uppercase"
              style={{
                color: 'var(--ed-primary, var(--color-text-secondary))',
                letterSpacing: '0.05em',
              }}
            >
              What we offer
            </p>
            <h2
              style={{
                fontFamily: 'var(--ed-font-heading, var(--font-heading))',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                color: 'var(--ed-on-surface, var(--color-text-primary))',
              }}
            >
              {heading}
            </h2>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
            {services.map((service, i) => {
              const bento = bentoItems[i] || { colSpan: 6, isFeatured: false }
              const matchedSlug = servicePageSlugs?.[service.name]
              const href = matchedSlug && basePath != null ? `${basePath}/${matchedSlug}` : undefined
              const iconName = sanitizeIconName(service.icon_suggestion)

              const cardBg = bento.isFeatured
                ? 'var(--ed-primary-container, var(--color-primary-light))'
                : 'var(--ed-surface-container-lowest, #ffffff)'
              const textColor = bento.isFeatured
                ? 'var(--ed-on-primary-container, var(--color-text-primary))'
                : 'var(--ed-on-surface, var(--color-text-primary))'

              const cardContent = (
                <>
                  {/* Step number */}
                  <span
                    className="mb-4 block text-xs font-semibold uppercase"
                    style={{
                      color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                      letterSpacing: '0.05em',
                    }}
                  >
                    0{i + 1}
                  </span>

                  {/* Icon */}
                  <span
                    className="mb-4 inline-flex items-center justify-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--ed-radius-full, 9999px)',
                      backgroundColor: bento.isFeatured
                        ? 'rgba(var(--ed-on-primary-fixed-rgb, 0,0,0), 0.08)'
                        : 'rgba(var(--ed-primary-rgb, 0,0,0), 0.08)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '24px',
                        color: bento.isFeatured
                          ? 'var(--ed-on-primary-container, var(--color-primary))'
                          : 'var(--ed-primary, var(--color-primary))',
                      }}
                    >
                      {iconName}
                    </span>
                  </span>

                  {/* Title */}
                  <h3
                    className="mb-2 text-lg font-semibold"
                    style={{
                      fontFamily: 'var(--ed-font-body, var(--font-body))',
                      fontWeight: 600,
                      color: textColor,
                    }}
                  >
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                      lineHeight: 1.6,
                    }}
                  >
                    {service.description}
                  </p>

                  {/* Link arrow */}
                  {href && (
                    <span
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
                      style={{
                        color: bento.isFeatured
                          ? 'var(--ed-on-primary-container, var(--color-primary))'
                          : 'var(--ed-primary, var(--color-primary))',
                        borderBottom: '2px solid var(--ed-secondary-fixed, var(--color-accent))',
                        paddingBottom: '2px',
                      }}
                    >
                      Learn more
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        arrow_forward
                      </span>
                    </span>
                  )}
                </>
              )

              const cardStyle: CSSProperties = {
                backgroundColor: cardBg,
                borderRadius: 'var(--ed-radius-lg, 2rem)',
                padding: bento.isFeatured ? 'clamp(2rem, 4vw, 2.5rem)' : 'clamp(1.5rem, 3vw, 2rem)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 500ms',
              }

              return href ? (
                <a
                  key={service.name}
                  href={href}
                  className="block hover:-translate-y-1"
                  style={{
                    ...cardStyle,
                    gridColumn: `span ${bento.colSpan}`,
                  }}
                >
                  {cardContent}
                </a>
              ) : (
                <div
                  key={service.name}
                  className="hover:-translate-y-1"
                  style={{
                    ...cardStyle,
                    gridColumn: `span ${bento.colSpan}`,
                  }}
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

  // =========================================================
  // Legacy rendering — unchanged
  // =========================================================
  const cardStyle = getCardStyle(cardVariant)

  return (
    <section id="services" className="px-4" style={{ paddingTop: 'var(--space-section, 6rem)', paddingBottom: 'var(--space-section, 6rem)' }} {...(dataSource && { 'data-source': dataSource })}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <h2 className="mb-10 text-center" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading, 700)', letterSpacing: 'var(--tracking-heading, -0.01em)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>{heading}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const matchedSlug = servicePageSlugs?.[service.name]
            const href = matchedSlug && basePath != null ? `${basePath}/${matchedSlug}` : undefined
            const cardContent = (
              <>
                {renderIcon(service.icon_suggestion, iconStyle)}
                <h3 className="mb-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{service.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{service.description}</p>
                {href && (<span className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-link, var(--color-primary))' }}>Learn more<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span></span>)}
              </>
            )
            return href ? (
              <a key={service.name} href={href} className="block p-8 transition-shadow hover:shadow-md" style={cardStyle}>{cardContent}</a>
            ) : (
              <div key={service.name} className="p-8 transition-shadow hover:shadow-md" style={{ ...cardStyle, textDecoration: undefined }}>{cardContent}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
