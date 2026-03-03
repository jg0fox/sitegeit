import type { CSSProperties } from 'react'

interface SiteServiceWhyProps {
  items: string[]
  businessName: string
  cardVariant?: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
}

function getCardStyle(variant: string): CSSProperties {
  const base: CSSProperties = { borderRadius: 'var(--radius-card)' }
  switch (variant) {
    case 'flat':
      return { ...base, backgroundColor: 'var(--color-background)' }
    case 'accent-top':
      return {
        ...base,
        backgroundColor: 'var(--color-background)',
        borderTop: '3px solid var(--color-accent)',
        borderLeft: '1px solid var(--color-border)',
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }
    case 'accent-left':
      return {
        ...base,
        backgroundColor: 'var(--color-background)',
        borderLeft: '3px solid var(--color-accent)',
        borderTop: '1px solid var(--color-border)',
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }
    default:
      return {
        ...base,
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-border)',
      }
  }
}

export function SiteServiceWhy({
  items,
  businessName,
  cardVariant = 'bordered',
}: SiteServiceWhyProps) {
  const cardStyle = getCardStyle(cardVariant)

  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 6rem)',
        paddingBottom: 'var(--space-section, 6rem)',
        backgroundColor: 'var(--color-section-alternate, var(--color-surface))',
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
          Why Choose {businessName}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-6"
              style={cardStyle}
            >
              <span
                className="material-symbols-outlined mt-0.5 shrink-0"
                style={{ fontSize: '22px', color: 'var(--color-accent, var(--color-primary))' }}
              >
                verified
              </span>
              <span
                className="text-sm leading-relaxed sm:text-base"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
