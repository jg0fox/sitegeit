import type { CSSProperties } from 'react'

interface SiteHeroProps {
  headline: string
  subheadline: string
  primaryCta: { label: string; type: string }
  secondaryCta: { label: string; type: string }
  phoneTel: string | null
  heroBackground?: 'solid' | 'gradient' | 'pattern'
  heroImageUrl?: string | null
}

function getHeroBgStyle(variant: string): CSSProperties {
  switch (variant) {
    case 'gradient':
      return {
        background: 'linear-gradient(135deg, var(--color-section-primary, var(--color-surface)) 0%, var(--color-background) 100%)',
      }
    case 'pattern':
      return {
        backgroundColor: 'var(--color-section-primary, var(--color-surface))',
        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(var(--color-primary-rgb, 0,0,0), 0.04) 2px, transparent 0)',
        backgroundSize: '50px 50px',
      }
    default: // 'solid'
      return {
        backgroundColor: 'var(--color-section-primary, var(--color-background))',
      }
  }
}

export function SiteHero({
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  phoneTel,
  heroBackground = 'solid',
  heroImageUrl,
}: SiteHeroProps) {
  function getCtaHref(type: string) {
    if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
    if (type === 'form') return '#contact'
    return '#services'
  }

  // When a hero image is provided, render with background image + overlay
  if (heroImageUrl) {
    return (
      <section
        className="relative flex flex-col items-center justify-center px-4 text-center"
        style={{
          gap: 'var(--space-lg, 1.5rem)',
          paddingTop: 'clamp(5rem, 10vw, 10rem)',
          paddingBottom: 'clamp(5rem, 10vw, 10rem)',
        }}
      >
        {/* Background image */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${heroImageUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay for text readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundColor: 'var(--color-hero-overlay, rgba(0, 0, 0, 0.55))',
          }}
        />
        {/* Content — positioned above overlay */}
        <div className="relative z-10 flex flex-col items-center gap-[var(--space-lg,1.5rem)]">
          <h1
            className="mx-auto max-w-3xl"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading, 700)',
              letterSpacing: 'var(--tracking-heading, -0.02em)',
              lineHeight: 1.1,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: 'var(--color-hero-text, #fff)',
            }}
          >
            {headline}
          </h1>
          <p
            className="mx-auto max-w-2xl text-lg sm:text-xl"
            style={{ color: 'var(--color-hero-text-secondary, rgba(255,255,255,0.85))' }}
          >
            {subheadline}
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href={getCtaHref(primaryCta.type)}
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius-button)',
              }}
            >
              {primaryCta.label}
            </a>
            <a
              href={getCtaHref(secondaryCta.type)}
              className="inline-flex items-center justify-center border px-8 py-3.5 text-base font-medium transition-colors"
              style={{
                borderColor: 'rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius-button)',
                color: 'var(--color-hero-text, #fff)',
              }}
            >
              {secondaryCta.label}
            </a>
          </div>
        </div>
      </section>
    )
  }

  // Default: no background image — use color-based background
  return (
    <section
      className="flex flex-col items-center justify-center px-4 text-center"
      style={{
        gap: 'var(--space-lg, 1.5rem)',
        paddingTop: 'clamp(4rem, 8vw, 8rem)',
        paddingBottom: 'var(--space-section, 6rem)',
        ...getHeroBgStyle(heroBackground),
      }}
    >
      <h1
        className="mx-auto max-w-3xl"
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading, 700)',
          letterSpacing: 'var(--tracking-heading, -0.02em)',
          lineHeight: 1.1,
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        }}
      >
        {headline}
      </h1>
      <p
        className="mx-auto max-w-2xl text-lg sm:text-xl"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {subheadline}
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <a
          href={getCtaHref(primaryCta.type)}
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          {primaryCta.label}
        </a>
        <a
          href={getCtaHref(secondaryCta.type)}
          className="inline-flex items-center justify-center border px-8 py-3.5 text-base font-medium transition-colors"
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
