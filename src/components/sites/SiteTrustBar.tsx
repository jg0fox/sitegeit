interface SiteTrustBarProps {
  items: { icon: string; text: string; source: 'verified' | 'inferred' | 'default' }[]
}

export function SiteTrustBar({ items }: SiteTrustBarProps) {
  return (
    <section
      className="px-4 py-8 sm:py-10"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 85%, var(--color-primary) 15%)',
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
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '28px',
                color: 'var(--color-primary)',
              }}
            >
              {item.icon}
            </span>
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
