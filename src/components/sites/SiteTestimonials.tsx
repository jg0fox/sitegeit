interface Testimonial {
  quote: string
  reviewer_name: string
  source: string
}

interface SiteTestimonialsProps {
  ratingDisplay: { source: string; rating: number; count: number } | null
  testimonials: Testimonial[]
}

export function SiteTestimonials({ ratingDisplay, testimonials }: SiteTestimonialsProps) {
  // Nothing to show if no rating and no testimonials
  if (!ratingDisplay && testimonials.length === 0) return null

  const stars = ratingDisplay
    ? Array.from({ length: 5 }, (_, i) => i < Math.round(ratingDisplay.rating))
    : []

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
        {/* Rating badge */}
        {ratingDisplay && (
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {stars.map((filled, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '24px',
                    color: filled ? '#facc15' : 'var(--color-border)',
                    fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {ratingDisplay.rating} stars from {ratingDisplay.count} {ratingDisplay.source} reviews
            </p>
          </div>
        )}

        {/* Testimonials grid */}
        {testimonials.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <blockquote
                key={i}
                className="border p-5"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                <p
                  className="mb-3 text-sm italic leading-relaxed"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <footer className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
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
