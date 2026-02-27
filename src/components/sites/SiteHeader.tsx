interface SiteHeaderProps {
  businessName: string
  phone: string | null
  phoneTel: string | null
}

export function SiteHeader({ businessName, phone, phoneTel }: SiteHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between px-4 py-3"
        style={{ maxWidth: 'var(--space-section, 1200px)' }}
      >
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            color: 'var(--color-text-primary)',
          }}
        >
          {businessName}
        </span>

        {phone && phoneTel && (
          <a
            href={`tel:${phoneTel}`}
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-button)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              phone
            </span>
            <span className="hidden sm:inline">{phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
        )}
      </div>
    </header>
  )
}
