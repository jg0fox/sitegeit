interface SiteCTAProps {
  heading: string
  body: string
  cta: { label: string; type: string }
  phoneTel: string | null
  bookingUrl?: string | null
  isEditorial?: boolean
}

export function SiteCTA({ heading, body, cta, phoneTel, bookingUrl, isEditorial }: SiteCTAProps) {
  function getCtaHref(type: string) {
    if (type === 'phone' && bookingUrl) return bookingUrl
    if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
    if (type === 'form') return '#contact'
    return '#services'
  }

  // =========================================================
  // Editorial rendering — dark CTA with decorative blur
  // =========================================================
  if (isEditorial) {
    return (
      <section
        id="contact"
        className="relative overflow-hidden px-6 md:px-8"
        style={{
          paddingTop: 'clamp(5rem, 10vw, 8rem)',
          paddingBottom: 'clamp(5rem, 10vw, 8rem)',
          backgroundColor: 'var(--ed-on-primary-fixed, var(--color-primary))',
        }}
      >
        {/* Decorative blur elements */}
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20"
          style={{
            background: 'var(--ed-primary-container, var(--color-primary-light))',
            filter: 'blur(80px)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full opacity-15"
          style={{
            background: 'var(--ed-secondary-container, var(--color-accent))',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2
            className="mb-5"
            style={{
              fontFamily: 'var(--ed-font-heading, var(--font-heading))',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              color: 'var(--ed-surface, #fff)',
            }}
          >
            {heading}
          </h2>
          <p
            className="mb-8 text-base sm:text-lg"
            style={{
              color: 'var(--ed-surface-container-high, rgba(255,255,255,0.75))',
              lineHeight: 1.6,
            }}
          >
            {body}
          </p>
          <a
            href={getCtaHref(cta.type)}
            {...(cta.type === 'phone' && bookingUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold transition-all duration-300 hover:-translate-y-[4px]"
            style={{
              backgroundColor: 'var(--ed-surface, #fff)',
              color: 'var(--ed-on-primary-fixed, var(--color-primary))',
              borderRadius: 'var(--ed-radius-full, 9999px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            }}
          >
            {cta.label}
          </a>
        </div>
      </section>
    )
  }

  // =========================================================
  // Legacy rendering — unchanged
  // =========================================================
  return (
    <section id="contact" className="px-4" style={{ paddingTop: 'var(--space-section, 6rem)', paddingBottom: 'var(--space-section, 6rem)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-text-on-primary-light)' }}>
      <div className="mx-auto max-w-xl text-center">
        <h2 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading, 700)', letterSpacing: 'var(--tracking-heading, -0.01em)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--color-text-on-primary-light)' }}>{heading}</h2>
        <p className="mb-8 text-base sm:text-lg" style={{ color: 'var(--color-text-secondary-on-primary-light)' }}>{body}</p>
        <a href={getCtaHref(cta.type)} {...(cta.type === 'phone' && bookingUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-colors" style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-button)' }}>{cta.label}</a>
      </div>
    </section>
  )
}
