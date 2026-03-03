import type { CSSProperties } from 'react'
import { SiteBreadcrumb } from './SiteBreadcrumb'

interface SiteServiceHeroProps {
  h1: string
  opening: string
  cta: { label: string; type: string }
  phoneTel: string | null
  breadcrumbs: { label: string; href?: string }[]
  siteSlug: string
  heroBackground?: 'solid' | 'gradient' | 'pattern'
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
    default:
      return {
        backgroundColor: 'var(--color-section-primary, var(--color-background))',
      }
  }
}

export function SiteServiceHero({
  h1,
  opening,
  cta,
  phoneTel,
  breadcrumbs,
  siteSlug,
  heroBackground = 'solid',
}: SiteServiceHeroProps) {
  function getCtaHref(type: string) {
    if (type === 'phone' && phoneTel) return `tel:${phoneTel}`
    if (type === 'form') return '#contact'
    return '#services'
  }

  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'clamp(3rem, 6vw, 6rem)',
        paddingBottom: 'var(--space-section, 6rem)',
        ...getHeroBgStyle(heroBackground),
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <div className="mb-6">
          <SiteBreadcrumb items={breadcrumbs} siteSlug={siteSlug} />
        </div>

        <div className="max-w-2xl">
          <h1
            className="mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading, 700)',
              letterSpacing: 'var(--tracking-heading, -0.02em)',
              lineHeight: 1.1,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            }}
          >
            {h1}
          </h1>

          <p
            className="mb-8 text-lg leading-relaxed sm:text-xl"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {opening}
          </p>

          <a
            href={getCtaHref(cta.type)}
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-button)',
            }}
          >
            {cta.label}
          </a>
        </div>
      </div>
    </section>
  )
}
