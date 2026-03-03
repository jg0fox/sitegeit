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
}

export function SiteTestimonials({
  ratingDisplay,
  testimonials,
  businessName,
  cardVariant = 'bordered',
}: SiteTestimonialsProps) {
  if (!ratingDisplay && testimonials.length === 0) return null

  const stars = ratingDisplay
    ? Array.from({ length: 5 }, (_, i) => i < Math.round(ratingDisplay.rating))
    : []

  const quoteCardStyle = (() => {
    const base = { borderRadius: 'var(--radius-card)' }
    switch (cardVariant) {
      case 'flat':
        return { ...base, backgroundColor: 'var(--color-background)' }
      case 'accent-top':
        return {
          ...base,
          backgroundColor: 'var(--color-background)',
          borderTop: '3px solid var(--color-accent)',
          borderLeft: '1px solid var(--color-border)',
          borderRight: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }
      case 'accent-left':
        return {
          ...base,
          backgroundColor: 'var(--color-background)',
          borderLeft: '3px solid var(--color-accent)',
          borderTop: '1px solid var(--color-border)',
          borderRight: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }
      default:
        return {
          ...base,
          backgroundColor: 'var(--color-background)',
          border: '1px solid var(--color-border)',
        }
    }
  })()

  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 6rem)',
        paddingBottom: 'var(--space-section, 6rem)',
        backgroundColor: 'var(--color-section-alternate, var(--color-surface))',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        {/* Compact rating header */}
        {ratingDisplay && (
          <div className="mb-10 flex flex-col items-center gap-2">
            {businessName && (
              <p
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {businessName}
              </p>
            )}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {stars.map((filled, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '22px',
                      color: filled ? 'var(--color-accent, #facc15)' : 'var(--color-border)',
                      fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {ratingDisplay.rating}
              </span>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                ({ratingDisplay.count} {ratingDisplay.source} reviews)
              </span>
            </div>
          </div>
        )}

        {/* Testimonials grid */}
        {testimonials.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <blockquote
                key={i}
                className="relative p-6"
                style={quoteCardStyle}
              >
                <span
                  className="absolute -top-3 left-4 text-4xl font-bold leading-none"
                  style={{ color: 'var(--color-accent, var(--color-primary))', opacity: 0.4 }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p
                  className="mb-4 text-sm italic leading-relaxed"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {testimonial.quote}
                </p>
                <footer className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  &mdash; {testimonial.reviewer_name}, {testimonial.source}
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
