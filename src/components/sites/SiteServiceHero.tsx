import type { CSSProperties } from 'react'
import { SiteBreadcrumb } from './SiteBreadcrumb'

interface SiteServiceHeroProps {
  h1: string
  opening: string
  cta: { label: string; type: string }
  phoneTel: string | null
  bookingUrl?: string | null
  breadcrumbs: { label: string; href?: string }[]
  basePath: string
  heroBackground?: 'solid' | 'gradient' | 'pattern'
  isEditorial?: boolean
}

function getHeroBgStyle(variant: string): CSSProperties {
  switch (variant) {
    case 'gradient': return { background: 'linear-gradient(135deg, var(--color-section-primary, var(--color-surface)) 0%, var(--color-background) 100%)' }
    case 'pattern': return { backgroundColor: 'var(--color-section-primary, var(--color-surface))', backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(var(--color-primary-rgb, 0,0,0), 0.04) 2px, transparent 0)', backgroundSize: '50px 50px' }
    default: return { backgroundColor: 'var(--color-section-primary, var(--color-background))' }
  }
}

export function SiteServiceHero({
  h1,
  opening,
  cta,
  phoneTel,
  bookingUrl,
  breadcrumbs,
  basePath,
  heroBackground = 'solid',
  isEditorial,
}: SiteServiceHeroProps) {
  function getCtaHref(type: string) {
    if (type === 'phone' && bookingUrl) return bookingUrl
    if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
    if (type === 'form') return '#contact'
    return '#services'
  }

  // =========================================================
  // Editorial rendering
  // =========================================================
  if (isEditorial) {
    return (
      <section
        className="px-6 md:px-8"
        style={{
          paddingTop: 'clamp(3rem, 6vw, 5rem)',
          paddingBottom: 'clamp(3rem, 6vw, 5rem)',
          backgroundColor: 'var(--ed-surface, var(--color-background))',
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1280px)' }}>
          <div className="mb-6">
            <SiteBreadcrumb items={breadcrumbs} basePath={basePath} isEditorial />
          </div>
          <div className="max-w-2xl">
            <h1
              className="mb-5"
              style={{
                fontFamily: 'var(--ed-font-heading, var(--font-heading))',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'var(--ed-on-surface, var(--color-text-primary))',
              }}
            >
              {h1}
            </h1>
            <p
              className="mb-8 text-lg leading-relaxed sm:text-xl"
              style={{
                color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                lineHeight: 1.6,
              }}
            >
              {opening}
            </p>
            <a
              href={getCtaHref(cta.type)}
              {...(cta.type === 'phone' && bookingUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold transition-all duration-300 hover:-translate-y-[4px]"
              style={{
                backgroundColor: 'var(--ed-on-primary-fixed, var(--color-primary))',
                color: 'var(--ed-surface, #fff)',
                borderRadius: 'var(--ed-radius-full, 9999px)',
                boxShadow: '0 8px 30px rgba(var(--ed-on-primary-fixed-rgb, 0,0,0), 0.05)',
              }}
            >
              {cta.label}
            </a>
          </div>
        </div>
      </section>
    )
  }

  // =========================================================
  // Legacy rendering — unchanged
  // =========================================================
  return (
    <section className="px-4" style={{ paddingTop: 'clamp(3rem, 6vw, 6rem)', paddingBottom: 'var(--space-section, 6rem)', ...getHeroBgStyle(heroBackground) }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <div className="mb-6"><SiteBreadcrumb items={breadcrumbs} basePath={basePath} /></div>
        <div className="max-w-2xl">
          <h1 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading, 700)', letterSpacing: 'var(--tracking-heading, -0.02em)', lineHeight: 1.1, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>{h1}</h1>
          <p className="mb-8 text-lg leading-relaxed sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>{opening}</p>
          <a href={getCtaHref(cta.type)} {...(cta.type === 'phone' && bookingUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-colors" style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-button)' }}>{cta.label}</a>
        </div>
      </div>
    </section>
  )
}
