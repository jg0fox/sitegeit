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
}

/**
 * Render a row of 5 stars with fractional fill support.
 * @param rating — e.g. 4.4
 * @param size — CSS font-size value, default '22px'
 */
function StarRow({ rating, size = '22px' }: { rating: number; size?: string }) {
  const fills = Array.from({ length: 5 }, (_, i) => {
    const diff = rating - i
    if (diff >= 1) return 1
    if (diff <= 0) return 0
    return Math.round(diff * 10) / 10
  })

  return (
    <div className="flex gap-0.5">
      {fills.map((fill, i) => {
        if (fill >= 1) {
          return (
            <span
              key={i}
              className="material-symbols-outlined"
              style={{
                fontSize: size,
                color: 'var(--color-accent, #facc15)',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              star
            </span>
          )
        }
        if (fill <= 0) {
          return (
            <span
              key={i}
              className="material-symbols-outlined"
              style={{
                fontSize: size,
                color: 'var(--color-star-empty, var(--color-border))',
                fontVariationSettings: "'FILL' 0",
              }}
            >
              star
            </span>
          )
        }
        // Partial star — gradient clip
        const pct = Math.round(fill * 100)
        return (
          <span
            key={i}
            className="material-symbols-outlined"
            style={{
              fontSize: size,
              fontVariationSettings: "'FILL' 1",
              background: `linear-gradient(90deg, var(--color-accent, #facc15) ${pct}%, var(--color-star-empty, var(--color-border)) ${pct}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            star
          </span>
        )
      })}
    </div>
  )
}

function GoogleReviewLink({ googlePlaceId }: { googlePlaceId: string }) {
  return (
    <a
      href={`https://search.google.com/local/reviews?placeid=${googlePlaceId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      Read reviews on Google
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '14px' }}
      >
        open_in_new
      </span>
    </a>
  )
}

/**
 * Mode A — Rich: stars + testimonial cards + Google link.
 * Used when we have testimonials AND 50+ reviews.
 */
function RichSocialProof({
  ratingDisplay,
  testimonials,
  businessName,
  cardVariant,
  googlePlaceId,
}: {
  ratingDisplay: { source: string; rating: number; count: number }
  testimonials: Testimonial[]
  businessName?: string
  cardVariant: string
  googlePlaceId?: string | null
}) {
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
        {/* Rating header */}
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
            <StarRow rating={ratingDisplay.rating} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {ratingDisplay.rating}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              ({ratingDisplay.count} {ratingDisplay.source} reviews)
            </span>
          </div>
          {googlePlaceId && (
            <div className="mt-1">
              <GoogleReviewLink googlePlaceId={googlePlaceId} />
            </div>
          )}
        </div>

        {/* Testimonials grid */}
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
      </div>
    </section>
  )
}

/**
 * Mode B — Compact: inline star badge only, no testimonial cards.
 * Used when we have a rating but no/few testimonials.
 */
function CompactSocialProof({
  ratingDisplay,
  businessName,
  googlePlaceId,
}: {
  ratingDisplay: { source: string; rating: number; count: number }
  businessName?: string
  googlePlaceId?: string | null
}) {
  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section-sm, 3rem)',
        paddingBottom: 'var(--space-section-sm, 3rem)',
      }}
    >
      <div
        className="mx-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6"
        style={{ maxWidth: 'var(--container-max-width, 1200px)' }}
      >
        <div className="flex items-center gap-3">
          <StarRow rating={ratingDisplay.rating} size="20px" />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {ratingDisplay.rating}
          </span>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            ({ratingDisplay.count} {ratingDisplay.source} reviews)
          </span>
        </div>
        {googlePlaceId && <GoogleReviewLink googlePlaceId={googlePlaceId} />}
      </div>
    </section>
  )
}

export function SiteTestimonials({
  ratingDisplay,
  testimonials,
  businessName,
  cardVariant = 'bordered',
  googlePlaceId,
}: SiteTestimonialsProps) {
  // Mode C — Hidden: no rating data at all
  if (!ratingDisplay) return null

  // Mode A — Rich: have testimonials AND enough reviews
  const hasTestimonials = testimonials.length > 0
  const hasSubstantialReviews = ratingDisplay.count >= 50

  if (hasTestimonials && hasSubstantialReviews) {
    return (
      <RichSocialProof
        ratingDisplay={ratingDisplay}
        testimonials={testimonials}
        businessName={businessName}
        cardVariant={cardVariant}
        googlePlaceId={googlePlaceId}
      />
    )
  }

  // Mode A fallback — have testimonials but fewer reviews, still show rich
  if (hasTestimonials) {
    return (
      <RichSocialProof
        ratingDisplay={ratingDisplay}
        testimonials={testimonials}
        businessName={businessName}
        cardVariant={cardVariant}
        googlePlaceId={googlePlaceId}
      />
    )
  }

  // Mode B — Compact: rating only, no testimonials
  return (
    <CompactSocialProof
      ratingDisplay={ratingDisplay}
      businessName={businessName}
      googlePlaceId={googlePlaceId}
    />
  )
}
