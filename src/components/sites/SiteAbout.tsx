interface SiteAboutProps {
  heading: string
  body: string
  ownerName: string | null
}

export function SiteAbout({ heading, body, ownerName }: SiteAboutProps) {
  return (
    <section
      className="px-4"
      style={{ paddingTop: 'var(--space-section, 5rem)', paddingBottom: 'var(--space-section, 5rem)' }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          className="mb-4 text-2xl sm:text-3xl"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            letterSpacing: 'var(--tracking-heading, -0.01em)',
          }}
        >
          {heading}
        </h2>
        <p
          className="mb-4 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {body}
        </p>
        {ownerName && (
          <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            &mdash; {ownerName}
          </p>
        )}
      </div>
    </section>
  )
}
