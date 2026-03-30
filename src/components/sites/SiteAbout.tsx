interface SiteAboutProps {
  heading: string
  body: string
  ownerName: string | null
  imageUrl?: string | null
  isEditorial?: boolean
}

export function SiteAbout({ heading, body, ownerName, imageUrl, isEditorial }: SiteAboutProps) {
  // =========================================================
  // Editorial rendering — asymmetric two-column
  // =========================================================
  if (isEditorial) {
    return (
      <section
        className="px-6 md:px-8"
        style={{
          paddingTop: 'clamp(4rem, 8vw, 6rem)',
          paddingBottom: 'clamp(4rem, 8vw, 6rem)',
          backgroundColor: 'var(--ed-surface, var(--color-background))',
        }}
      >
        <div
          className="mx-auto grid items-center gap-12 md:grid-cols-12"
          style={{ maxWidth: 'var(--container-max-width, 1280px)' }}
        >
          {/* Image column (5/12) — only on desktop if image exists */}
          {imageUrl && (
            <div className="md:col-span-5">
              <div
                className="overflow-hidden"
                style={{ borderRadius: 'var(--ed-radius-xl, 3rem)' }}
              >
                <img
                  src={imageUrl}
                  alt=""
                  className="h-auto w-full object-cover"
                  style={{ aspectRatio: '4 / 5' }}
                />
              </div>
            </div>
          )}

          {/* Text column (7/12 or full) */}
          <div className={imageUrl ? 'md:col-span-7' : 'md:col-span-10 md:col-start-2'}>
            <p
              className="mb-3 text-xs font-semibold uppercase"
              style={{
                color: 'var(--ed-primary, var(--color-text-secondary))',
                letterSpacing: '0.05em',
              }}
            >
              About us
            </p>

            <h2
              className="mb-6"
              style={{
                fontFamily: 'var(--ed-font-heading, var(--font-heading))',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                color: 'var(--ed-on-surface, var(--color-text-primary))',
              }}
            >
              {heading}
            </h2>

            <p
              className="text-base leading-relaxed sm:text-lg"
              style={{
                color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                lineHeight: 1.6,
                maxWidth: '580px',
              }}
            >
              {body}
            </p>

            {ownerName && (
              <p
                className="mt-6 text-sm font-semibold"
                style={{
                  color: 'var(--ed-primary, var(--color-primary))',
                  borderBottom: '2px solid var(--ed-secondary-fixed, var(--color-accent))',
                  display: 'inline-block',
                  paddingBottom: '2px',
                }}
              >
                &mdash; {ownerName}
              </p>
            )}
          </div>
        </div>
      </section>
    )
  }

  // =========================================================
  // Legacy rendering — unchanged
  // =========================================================
  return (
    <section className="px-4" style={{ paddingTop: 'var(--space-section, 6rem)', paddingBottom: 'var(--space-section, 6rem)' }}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading, 700)', letterSpacing: 'var(--tracking-heading, -0.01em)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>{heading}</h2>
        <div className="mx-auto mb-6" style={{ width: '48px', height: '3px', backgroundColor: 'var(--color-accent, var(--color-primary))', borderRadius: '2px' }} />
        {imageUrl && (
          <div className="mb-6">
            <img src={imageUrl} alt="" className="mx-auto rounded-lg" style={{ maxWidth: '280px', width: '100%', height: 'auto', borderRadius: 'var(--radius-card, 12px)' }} />
          </div>
        )}
        <p className="mb-4 text-base leading-relaxed sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>{body}</p>
        {ownerName && <p className="text-sm font-medium" style={{ color: 'var(--color-link, var(--color-primary))' }}>&mdash; {ownerName}</p>}
      </div>
    </section>
  )
}
