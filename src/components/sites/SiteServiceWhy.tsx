interface SiteServiceWhyProps {
  items: string[]
  businessName: string
}

export function SiteServiceWhy({ items, businessName }: SiteServiceWhyProps) {
  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 5rem)',
        paddingBottom: 'var(--space-section, 5rem)',
        backgroundColor: 'var(--color-surface)',
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
          Why Choose {businessName}
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border p-5"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <span
                className="material-symbols-outlined mt-0.5 shrink-0"
                style={{ fontSize: '22px', color: 'var(--color-primary)' }}
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
