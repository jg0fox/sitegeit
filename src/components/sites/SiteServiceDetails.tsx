interface SiteServiceDetailsProps {
  items: string[]
}

export function SiteServiceDetails({ items }: SiteServiceDetailsProps) {
  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 5rem)',
        paddingBottom: 'var(--space-section, 5rem)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <h2
          className="mb-8 text-center text-2xl sm:text-3xl"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            letterSpacing: 'var(--tracking-heading, -0.01em)',
          }}
        >
          What&rsquo;s Included
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border p-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <span
                className="material-symbols-outlined mt-0.5 shrink-0"
                style={{ fontSize: '22px', color: 'var(--color-primary)' }}
              >
                check_circle
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
