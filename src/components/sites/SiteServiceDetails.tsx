import type { CSSProperties } from 'react'

interface SiteServiceDetailsProps {
  items: string[]
  cardVariant?: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
  iconStyle?: 'bare' | 'circle-bg' | 'square-bg'
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

function renderCheckIcon(style: string) {
  // Icons in colored containers use accent for better contrast on dark themes
  const bgIconColor = 'var(--color-accent, var(--color-primary))'
  const iconFallbackBg = 'var(--color-icon-bg, rgba(var(--color-accent-rgb, 163,163,163), 0.35))'

  if (style === 'circle-bg') {
    return (
      <span
        className="mt-0.5 inline-flex shrink-0 items-center justify-center"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: iconFallbackBg,
        }}
      >
        <span
          className="material-symbols-outlined shrink-0"
          style={{ fontSize: '20px', color: bgIconColor }}
        >
          check_circle
        </span>
      </span>
    )
  }

  if (style === 'square-bg') {
    return (
      <span
        className="mt-0.5 inline-flex shrink-0 items-center justify-center"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm, 4px)',
          backgroundColor: iconFallbackBg,
        }}
      >
        <span
          className="material-symbols-outlined shrink-0"
          style={{ fontSize: '20px', color: bgIconColor }}
        >
          check_circle
        </span>
      </span>
    )
  }

  // bare — no background, use accent with primary fallback
  return (
    <span
      className="material-symbols-outlined mt-0.5 shrink-0"
      style={{ fontSize: '22px', color: 'var(--color-accent, var(--color-primary))' }}
    >
      check_circle
    </span>
  )
}

export function SiteServiceDetails({
  items,
  cardVariant = 'bordered',
  iconStyle = 'bare',
}: SiteServiceDetailsProps) {
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
          What&rsquo;s Included
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-5"
              style={cardStyle}
            >
              {renderCheckIcon(iconStyle)}
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
