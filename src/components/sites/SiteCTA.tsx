interface SiteCTAProps {
  heading: string
  body: string
  cta: { label: string; type: string }
  phoneTel: string | null
}

export function SiteCTA({ heading, body, cta, phoneTel }: SiteCTAProps) {
  function getCtaHref(type: string) {
    if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
    if (type === 'form') return '#contact'
    return '#services'
  }

  return (
    <section
      id="contact"
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 5rem)',
        paddingBottom: 'var(--space-section, 5rem)',
        backgroundColor: 'var(--color-primary-light)',
        color: '#1e293b',
      }}
    >
      <div className="mx-auto max-w-xl text-center">
        <h2
          className="mb-3 text-2xl sm:text-3xl"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            letterSpacing: 'var(--tracking-heading, -0.01em)',
            color: '#0f172a',
          }}
        >
          {heading}
        </h2>
        <p
          className="mb-6"
          style={{ color: '#475569' }}
        >
          {body}
        </p>
        <a
          href={getCtaHref(cta.type)}
          className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-colors"
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
