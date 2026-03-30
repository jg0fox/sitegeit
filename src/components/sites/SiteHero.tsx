import type { CSSProperties } from 'react'

interface SiteHeroProps {
  headline: string
  subheadline: string
  primaryCta: { label: string; type: string }
  secondaryCta: { label: string; type: string }
  phoneTel: string | null
  bookingUrl?: string | null
  heroBackground?: 'solid' | 'gradient' | 'pattern'
  heroImageUrl?: string | null
  isEditorial?: boolean
  sparkleTags?: string[]
}

function getHeroBgStyle(variant: string): CSSProperties {
  switch (variant) {
    case 'gradient':
      return { background: 'linear-gradient(135deg, var(--color-section-primary, var(--color-surface)) 0%, var(--color-background) 100%)' }
    case 'pattern':
      return { backgroundColor: 'var(--color-section-primary, var(--color-surface))', backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(var(--color-primary-rgb, 0,0,0), 0.04) 2px, transparent 0)', backgroundSize: '50px 50px' }
    default:
      return { backgroundColor: 'var(--color-section-primary, var(--color-background))' }
  }
}

function getCtaHref(type: string, bookingUrl?: string | null, phoneTel?: string | null) {
  if (type === 'phone' && bookingUrl) return bookingUrl
  if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
  if (type === 'form') return '#contact'
  return '#services'
}

function getCtaLinkProps(type: string, bookingUrl?: string | null) {
  if (type === 'phone' && bookingUrl) return { target: '_blank' as const, rel: 'noopener noreferrer' }
  return {}
}

export function SiteHero({
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  phoneTel,
  bookingUrl,
  heroBackground = 'solid',
  heroImageUrl,
  isEditorial,
  sparkleTags,
}: SiteHeroProps) {
  // =========================================================
  // Editorial rendering — two-column bento with floating elements
  // =========================================================
  if (isEditorial) {
    return (
      <section
        className="px-6 md:px-8"
        style={{
          paddingTop: 'clamp(4rem, 8vw, 8rem)',
          paddingBottom: 'clamp(4rem, 8vw, 8rem)',
          backgroundColor: 'var(--ed-surface, var(--color-background))',
        }}
      >
        <div
          className="mx-auto grid items-center gap-12 md:grid-cols-12"
          style={{ maxWidth: 'var(--container-max-width, 1280px)' }}
        >
          {/* Left column — content (7/12) */}
          <div className="md:col-span-7">
            {/* Sparkle tags */}
            {sparkleTags && sparkleTags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {sparkleTags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium uppercase"
                    style={{
                      backgroundColor: 'var(--ed-secondary-container, var(--color-accent))',
                      color: 'var(--ed-on-secondary-container, var(--color-text-primary))',
                      borderRadius: 'var(--ed-radius-full, 9999px)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1
              style={{
                fontFamily: 'var(--ed-font-heading, var(--font-heading))',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                color: 'var(--ed-on-surface, var(--color-text-primary))',
              }}
            >
              {headline}
            </h1>

            <p
              className="mt-6 text-lg leading-relaxed sm:text-xl"
              style={{
                color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                lineHeight: 1.6,
                maxWidth: '540px',
              }}
            >
              {subheadline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              {/* Primary CTA — dark pill button */}
              <a
                href={getCtaHref(primaryCta.type, bookingUrl, phoneTel)}
                {...getCtaLinkProps(primaryCta.type, bookingUrl)}
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold transition-all duration-300 hover:-translate-y-[4px]"
                style={{
                  backgroundColor: 'var(--ed-on-primary-fixed, var(--color-primary))',
                  color: 'var(--ed-surface, #fff)',
                  borderRadius: 'var(--ed-radius-full, 9999px)',
                  boxShadow: '0 8px 30px rgba(var(--ed-on-primary-fixed-rgb, 0,0,0), 0.05)',
                }}
              >
                {primaryCta.label}
              </a>

              {/* Secondary CTA — soft pill button */}
              <a
                href={getCtaHref(secondaryCta.type, bookingUrl, phoneTel)}
                {...getCtaLinkProps(secondaryCta.type, bookingUrl)}
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium transition-all duration-300 hover:-translate-y-[4px]"
                style={{
                  backgroundColor: 'var(--ed-primary-container, var(--color-primary-light))',
                  color: 'var(--ed-on-primary-container, var(--color-text-primary))',
                  borderRadius: 'var(--ed-radius-full, 9999px)',
                }}
              >
                {secondaryCta.label}
              </a>
            </div>
          </div>

          {/* Right column — hero image (5/12) */}
          {heroImageUrl && (
            <div className="relative md:col-span-5">
              <div
                className="overflow-hidden"
                style={{ borderRadius: 'var(--ed-radius-xl, 3rem)' }}
              >
                <img
                  src={heroImageUrl}
                  alt=""
                  className="h-auto w-full object-cover transition-transform duration-1000 hover:scale-105"
                  style={{ aspectRatio: '4 / 5' }}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  // =========================================================
  // Legacy rendering — unchanged from original
  // =========================================================
  if (heroImageUrl) {
    return (
      <section className="relative flex flex-col items-center justify-center px-4 text-center" style={{ gap: 'var(--space-lg, 1.5rem)', paddingTop: 'clamp(5rem, 10vw, 10rem)', paddingBottom: 'clamp(5rem, 10vw, 10rem)' }}>
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: `url("${heroImageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: 'var(--color-hero-overlay, rgba(0, 0, 0, 0.55))' }} />
        <div className="relative z-10 flex flex-col items-center gap-[var(--space-lg,1.5rem)]">
          <h1 className="mx-auto max-w-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading, 700)', letterSpacing: 'var(--tracking-heading, -0.02em)', lineHeight: 1.1, fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-hero-text, #fff)' }}>{headline}</h1>
          <p className="mx-auto max-w-2xl text-lg sm:text-xl" style={{ color: 'var(--color-hero-text-secondary, rgba(255,255,255,0.85))' }}>{subheadline}</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a href={getCtaHref(primaryCta.type, bookingUrl, phoneTel)} {...getCtaLinkProps(primaryCta.type, bookingUrl)} className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold transition-colors" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-button)' }}>{primaryCta.label}</a>
            <a href={getCtaHref(secondaryCta.type, bookingUrl, phoneTel)} {...getCtaLinkProps(secondaryCta.type, bookingUrl)} className="inline-flex items-center justify-center border px-8 py-3.5 text-base font-medium transition-colors" style={{ borderColor: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-button)', color: 'var(--color-hero-text, #fff)' }}>{secondaryCta.label}</a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col items-center justify-center px-4 text-center" style={{ gap: 'var(--space-lg, 1.5rem)', paddingTop: 'clamp(4rem, 8vw, 8rem)', paddingBottom: 'var(--space-section, 6rem)', ...getHeroBgStyle(heroBackground) }}>
      <h1 className="mx-auto max-w-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading, 700)', letterSpacing: 'var(--tracking-heading, -0.02em)', lineHeight: 1.1, fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>{headline}</h1>
      <p className="mx-auto max-w-2xl text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>{subheadline}</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <a href={getCtaHref(primaryCta.type, bookingUrl, phoneTel)} {...getCtaLinkProps(primaryCta.type, bookingUrl)} className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-colors" style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-button)' }}>{primaryCta.label}</a>
        <a href={getCtaHref(secondaryCta.type, bookingUrl, phoneTel)} {...getCtaLinkProps(secondaryCta.type, bookingUrl)} className="inline-flex items-center justify-center border px-8 py-3.5 text-base font-medium transition-colors" style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-button)', color: 'var(--color-text-primary)' }}>{secondaryCta.label}</a>
      </div>
    </section>
  )
}
