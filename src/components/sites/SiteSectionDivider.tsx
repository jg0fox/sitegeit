interface SiteSectionDividerProps {
  variant: 'none' | 'angled' | 'curved' | 'line'
  fillColor?: string
}

export function SiteSectionDivider({ variant, fillColor }: SiteSectionDividerProps) {
  if (variant === 'none') return null

  if (variant === 'line') {
    return (
      <div
        className="mx-auto px-4"
        style={{ maxWidth: 'var(--container-max-width, 1200px)' }}
      >
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
      </div>
    )
  }

  if (variant === 'angled') {
    return (
      <div
        aria-hidden="true"
        style={{
          height: '48px',
          backgroundColor: fillColor || 'var(--color-section-alternate, var(--color-surface))',
          clipPath: 'polygon(0 0, 100% 100%, 100% 100%, 0 100%)',
        }}
      />
    )
  }

  if (variant === 'curved') {
    return (
      <div aria-hidden="true" style={{ lineHeight: 0, overflow: 'hidden' }}>
        <svg
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '48px' }}
        >
          <path
            d="M0,48 C480,0 960,0 1440,48 L1440,48 L0,48 Z"
            fill={fillColor || 'var(--color-section-alternate, var(--color-surface))'}
          />
        </svg>
      </div>
    )
  }

  return null
}
