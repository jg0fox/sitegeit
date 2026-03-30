interface SiteCTAProps {
  heading: string
  body: string
  cta: { label: string; type: string }
  phoneTel: string | null
  bookingUrl?: string | null
}

export function SiteCTA({ heading, body, cta, phoneTel, bookingUrl }: SiteCTAProps) {
  function getCtaHref(type: string) {
    if (type === 'phone' && bookingUrl) return bookingUrl
    if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
    if (type === 'form') return '#contact'
    return '#services'
  }

  return (
    <section
      id="contact"
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 6rem)',
        paddingBottom: 'var(--space-section, 6rem)',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-text-on-primary-light)',
      }}
    >
      <div className="mx-auto max-w-xl text-center">
        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            letterSpacing: 'var(--tracking-heading, -0.01em)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            color: 'var(--color-text-on-primary-light)',
          }}
        >
          {heading}
        </h2>
        <p
          className="mb-8 text-base sm:text-lg"
          style={{ color: 'var(--color-text-secondary-on-primary-light)' }}
        >
          {body}
        </p>
        <a
          href={getCtaHref(cta.type)}
          {...(cta.type === 'phone' && bookingUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          {cta.label}
        </a>
      </div>
    </section>
  )
}
