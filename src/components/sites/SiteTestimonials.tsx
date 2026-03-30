interface Testimonial {
  quote: string
  reviewer_name: string
  source: string
}

interface SiteTestimonialsProps {
  ratingDisplay: { source: string; rating: number; count: number } | null
  testimonials: Testimonial[]
  businessName?: string
  cardVariant?: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
  googlePlaceId?: string | null
  isEditorial?: boolean
}

function StarRow({ rating, size = '22px', isEditorial }: { rating: number; size?: string; isEditorial?: boolean }) {
  const fills = Array.from({ length: 5 }, (_, i) => {
    const diff = rating - i
    if (diff >= 1) return 1
    if (diff <= 0) return 0
    return Math.round(diff * 10) / 10
  })

  const fillColor = isEditorial
    ? 'var(--ed-star-fill, var(--ed-secondary-container, #fcc740))'
    : 'var(--color-accent, #facc15)'
  const emptyColor = isEditorial
    ? 'var(--ed-surface-dim, #ddd)'
    : 'var(--color-star-empty, var(--color-border))'

  return (
    <div className="flex gap-0.5">
      {fills.map((fill, i) => {
        if (fill >= 1) return (<span key={i} className="material-symbols-outlined" style={{ fontSize: size, color: fillColor, fontVariationSettings: "'FILL' 1" }}>star</span>)
        if (fill <= 0) return (<span key={i} className="material-symbols-outlined" style={{ fontSize: size, color: emptyColor, fontVariationSettings: "'FILL' 0" }}>star</span>)
        const pct = Math.round(fill * 100)
        return (<span key={i} className="material-symbols-outlined" style={{ fontSize: size, fontVariationSettings: "'FILL' 1", background: `linear-gradient(90deg, ${fillColor} ${pct}%, ${emptyColor} ${pct}%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>star</span>)
      })}
    </div>
  )
}

function GoogleReviewLink({ googlePlaceId, isEditorial }: { googlePlaceId: string; isEditorial?: boolean }) {
  return (
    <a
      href={`https://search.google.com/local/reviews?placeid=${googlePlaceId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
      style={{
        color: isEditorial
          ? 'var(--ed-on-surface-variant, var(--color-text-secondary))'
          : 'var(--color-text-secondary)',
      }}
    >
      Read reviews on Google
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
    </a>
  )
}

export function SiteTestimonials({
  ratingDisplay,
  testimonials,
  businessName,
  cardVariant = 'bordered',
  googlePlaceId,
  isEditorial,
}: SiteTestimonialsProps) {
  if (!ratingDisplay) return null

  const hasTestimonials = testimonials.length > 0

  // =========================================================
  // Editorial rendering — editorial masonry grid
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
        <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1280px)' }}>
          {/* Rating header */}
          <div className="mb-12">
            {businessName && (
              <p
                className="mb-3 text-xs font-semibold uppercase"
                style={{
                  color: 'var(--ed-primary, var(--color-text-secondary))',
                  letterSpacing: '0.05em',
                }}
              >
                What our clients say
              </p>
            )}
            <div className="flex items-center gap-3">
              <StarRow rating={ratingDisplay.rating} size="24px" isEditorial />
              <span
                className="text-lg font-bold"
                style={{
                  fontFamily: 'var(--ed-font-heading, var(--font-heading))',
                  color: 'var(--ed-on-surface, var(--color-text-primary))',
                }}
              >
                {ratingDisplay.rating}
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--ed-on-surface-variant, var(--color-text-secondary))' }}
              >
                ({ratingDisplay.count} {ratingDisplay.source} reviews)
              </span>
            </div>
            {googlePlaceId && (
              <div className="mt-2">
                <GoogleReviewLink googlePlaceId={googlePlaceId} isEditorial />
              </div>
            )}
          </div>

          {/* Testimonials — editorial masonry */}
          {hasTestimonials && (
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              style={{ gridAutoRows: 'auto' }}
            >
              {testimonials.map((testimonial, i) => {
                const isFeatured = i === 0
                return (
                  <blockquote
                    key={i}
                    className={`relative transition-transform duration-500 hover:-translate-y-1 ${
                      isFeatured ? 'sm:row-span-2' : ''
                    }`}
                    style={{
                      backgroundColor: isFeatured
                        ? 'var(--ed-primary-container, var(--color-primary-light))'
                        : 'var(--ed-surface-container-lowest, #ffffff)',
                      borderRadius: 'var(--ed-radius-lg, 2rem)',
                      padding: isFeatured ? 'clamp(2rem, 4vw, 2.5rem)' : 'clamp(1.5rem, 3vw, 2rem)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div className="mb-4">
                        <StarRow rating={ratingDisplay.rating} size="18px" isEditorial />
                      </div>
                      <p
                        className={`italic leading-relaxed ${isFeatured ? 'text-base sm:text-lg' : 'text-sm'}`}
                        style={{
                          color: isFeatured
                            ? 'var(--ed-on-primary-container, var(--color-text-primary))'
                            : 'var(--ed-on-surface, var(--color-text-primary))',
                          lineHeight: 1.6,
                        }}
                      >
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </div>
                    <footer
                      className="mt-4 text-xs font-medium"
                      style={{
                        color: isFeatured
                          ? 'var(--ed-primary, var(--color-text-secondary))'
                          : 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                      }}
                    >
                      &mdash; {testimonial.reviewer_name}, {testimonial.source}
                    </footer>
                  </blockquote>
                )
              })}
            </div>
          )}
        </div>
      </section>
    )
  }

  // =========================================================
  // Legacy rendering — unchanged
  // =========================================================
  if (!hasTestimonials) {
    // Compact mode
    return (
      <section className="px-4" style={{ paddingTop: 'var(--space-section-sm, 3rem)', paddingBottom: 'var(--space-section-sm, 3rem)' }}>
        <div className="mx-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
          <div className="flex items-center gap-3">
            <StarRow rating={ratingDisplay.rating} size="20px" />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{ratingDisplay.rating}</span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>({ratingDisplay.count} {ratingDisplay.source} reviews)</span>
          </div>
          {googlePlaceId && <GoogleReviewLink googlePlaceId={googlePlaceId} />}
        </div>
      </section>
    )
  }

  // Rich mode
  const quoteCardStyle = (() => {
    const base = { borderRadius: 'var(--radius-card)' }
    switch (cardVariant) {
      case 'flat': return { ...base, backgroundColor: 'var(--color-background)' }
      case 'accent-top': return { ...base, backgroundColor: 'var(--color-background)', borderTop: '3px solid var(--color-accent)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }
      case 'accent-left': return { ...base, backgroundColor: 'var(--color-background)', borderLeft: '3px solid var(--color-accent)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }
      default: return { ...base, backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }
    }
  })()

  return (
    <section className="px-4" style={{ paddingTop: 'var(--space-section, 6rem)', paddingBottom: 'var(--space-section, 6rem)', backgroundColor: 'var(--color-section-alternate, var(--color-surface))' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <div className="mb-10 flex flex-col items-center gap-2">
          {businessName && <p className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>{businessName}</p>}
          <div className="flex items-center gap-2">
            <StarRow rating={ratingDisplay.rating} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{ratingDisplay.rating}</span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>({ratingDisplay.count} {ratingDisplay.source} reviews)</span>
          </div>
          {googlePlaceId && <div className="mt-1"><GoogleReviewLink googlePlaceId={googlePlaceId} /></div>}
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <blockquote key={i} className="relative p-6" style={quoteCardStyle}>
              <span className="absolute -top-3 left-4 text-4xl font-bold leading-none" style={{ color: 'var(--color-accent, var(--color-primary))', opacity: 0.4 }} aria-hidden="true">&ldquo;</span>
              <p className="mb-4 text-sm italic leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{testimonial.quote}</p>
              <footer className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>&mdash; {testimonial.reviewer_name}, {testimonial.source}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
