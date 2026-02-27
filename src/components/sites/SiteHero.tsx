interface SiteHeroProps {
  headline: string
  subheadline: string
  primaryCta: { label: string; type: string }
  secondaryCta: { label: string; type: string }
  phoneTel: string | null
}

export function SiteHero({ headline, subheadline, primaryCta, secondaryCta, phoneTel }: SiteHeroProps) {
  function getCtaHref(type: string) {
    if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
    if (type === 'form') return '#contact'
    return '#services'
  }

  return (
    <section
      className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24"
      style={{ gap: 'var(--space-lg, 1.5rem)' }}
    >
      <h1
        className="mx-auto max-w-3xl text-3xl sm:text-4xl md:text-5xl"
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading, 700)',
          letterSpacing: 'var(--tracking-heading, -0.02em)',
          lineHeight: 1.15,
        }}
      >
        {headline}
      </h1>
      <p
        className="mx-auto max-w-2xl text-lg"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {subheadline}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <a
          href={getCtaHref(primaryCta.type)}
          className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          {primaryCta.label}
        </a>
        <a
          href={getCtaHref(secondaryCta.type)}
          className="inline-flex items-center justify-center border px-6 py-3 text-base font-medium transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-button)',
            color: 'var(--color-text-primary)',
          }}
        >
          {secondaryCta.label}
        </a>
      </div>
    </section>
  )
}
