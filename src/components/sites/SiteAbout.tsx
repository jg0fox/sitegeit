interface SiteAboutProps {
  heading: string
  body: string
  ownerName: string | null
  imageUrl?: string | null
}

export function SiteAbout({ heading, body, ownerName, imageUrl }: SiteAboutProps) {
  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 6rem)',
        paddingBottom: 'var(--space-section, 6rem)',
      }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            letterSpacing: 'var(--tracking-heading, -0.01em)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          }}
        >
          {heading}
        </h2>
        <div
          className="mx-auto mb-6"
          style={{
            width: '48px',
            height: '3px',
            backgroundColor: 'var(--color-accent, var(--color-primary))',
            borderRadius: '2px',
          }}
        />
        {imageUrl && (
          <div className="mb-6">
            <img
              src={imageUrl}
              alt=""
              className="mx-auto rounded-lg"
              style={{
                maxWidth: '280px',
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--radius-card, 12px)',
              }}
            />
          </div>
        )}
        <p
          className="mb-4 text-base leading-relaxed sm:text-lg"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {body}
        </p>
        {ownerName && (
          <p className="text-sm font-medium" style={{ color: 'var(--color-link, var(--color-primary))' }}>
            &mdash; {ownerName}
          </p>
        )}
      </div>
    </section>
  )
}
