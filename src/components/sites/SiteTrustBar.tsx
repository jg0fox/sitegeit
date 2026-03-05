import { sanitizeIconName } from '@/lib/utils/sanitize-icon'

interface SiteTrustBarProps {
  items: { icon: string; text: string; source: 'verified' | 'inferred' | 'default' }[]
  iconStyle?: 'bare' | 'circle-bg' | 'square-bg'
}

function renderTrustIcon(rawIconName: string, style: string) {
  const iconName = sanitizeIconName(rawIconName, 'verified')
  // Icons in colored containers use accent for better contrast on dark themes
  const bgIconColor = 'var(--color-accent, var(--color-primary))'
  const iconFallbackBg = 'var(--color-icon-bg, rgba(var(--color-accent-rgb, 163,163,163), 0.35))'

  if (style === 'circle-bg') {
    return (
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: iconFallbackBg,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '24px', color: bgIconColor }}
        >
          {iconName}
        </span>
      </span>
    )
  }

  if (style === 'square-bg') {
    return (
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-sm, 4px)',
          backgroundColor: iconFallbackBg,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '24px', color: bgIconColor }}
        >
          {iconName}
        </span>
      </span>
    )
  }

  // bare — no background, use accent with primary fallback
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: '28px', color: 'var(--color-accent, var(--color-primary))' }}
    >
      {iconName}
    </span>
  )
}

export function SiteTrustBar({ items, iconStyle = 'bare' }: SiteTrustBarProps) {
  return (
    <section
      className="px-4 py-8 sm:py-10"
      style={{
        backgroundColor: 'var(--color-section-alternate, var(--color-surface))',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="mx-auto grid grid-cols-2 gap-4 sm:gap-6 md:flex md:items-center md:justify-evenly"
        style={{ maxWidth: 'var(--container-max-width, 1200px)' }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 text-center"
            data-source={item.source}
          >
            {renderTrustIcon(item.icon, iconStyle)}
            <span
              className="text-xs font-medium sm:text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
