import { sanitizeIconName } from '@/lib/utils/sanitize-icon'
import { getBentoLayout } from '@/lib/utils/bento-layouts'

interface ProcessStep {
  number: string
  title: string
  description: string
  icon: string
}

interface SiteProcessStepsProps {
  heading: string
  steps: ProcessStep[]
}

/**
 * Editorial-only component — bento grid with large step numbers.
 * Renders the "How it works" process section.
 */
export function SiteProcessSteps({ heading, steps }: SiteProcessStepsProps) {
  const bentoItems = getBentoLayout(steps.length, 0)

  return (
    <section
      className="px-6 md:px-8"
      style={{
        paddingTop: 'clamp(4rem, 8vw, 6rem)',
        paddingBottom: 'clamp(4rem, 8vw, 6rem)',
        backgroundColor: 'var(--ed-surface, var(--color-background))',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1280px)' }}>
        <div className="mb-12">
          <p
            className="mb-3 text-xs font-semibold uppercase"
            style={{
              color: 'var(--ed-primary, var(--color-text-secondary))',
              letterSpacing: '0.05em',
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: 'var(--ed-font-heading, var(--font-heading))',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              color: 'var(--ed-on-surface, var(--color-text-primary))',
            }}
          >
            {heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
          {steps.map((step, i) => {
            const bento = bentoItems[i] || { colSpan: 6, isFeatured: false }
            const iconName = sanitizeIconName(step.icon)

            return (
              <div
                key={i}
                className="relative overflow-hidden transition-transform duration-500 hover:-translate-y-1"
                style={{
                  backgroundColor: bento.isFeatured
                    ? 'var(--ed-primary-container, var(--color-primary-light))'
                    : 'var(--ed-surface-container-lowest, #ffffff)',
                  borderRadius: 'var(--ed-radius-lg, 2rem)',
                  padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                  gridColumn: `span ${bento.colSpan}`,
                }}
              >
                {/* Large background step number */}
                <span
                  className="absolute -right-2 -top-4 font-bold leading-none opacity-[0.06]"
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--ed-font-heading, var(--font-heading))',
                    fontSize: 'clamp(6rem, 10vw, 10rem)',
                    color: 'var(--ed-on-surface, var(--color-text-primary))',
                  }}
                >
                  {step.number}
                </span>

                {/* Content */}
                <div className="relative z-10">
                  <span
                    className="mb-4 block text-xs font-semibold uppercase"
                    style={{
                      color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Step {step.number}
                  </span>

                  <span
                    className="mb-4 inline-flex items-center justify-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--ed-radius-full, 9999px)',
                      backgroundColor: bento.isFeatured
                        ? 'rgba(var(--ed-on-primary-fixed-rgb, 0,0,0), 0.08)'
                        : 'rgba(var(--ed-primary-rgb, 0,0,0), 0.08)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '24px',
                        color: bento.isFeatured
                          ? 'var(--ed-on-primary-container, var(--color-primary))'
                          : 'var(--ed-primary, var(--color-primary))',
                      }}
                    >
                      {iconName}
                    </span>
                  </span>

                  <h3
                    className="mb-2 text-lg font-semibold"
                    style={{
                      fontFamily: 'var(--ed-font-body, var(--font-body))',
                      fontWeight: 600,
                      color: bento.isFeatured
                        ? 'var(--ed-on-primary-container, var(--color-text-primary))'
                        : 'var(--ed-on-surface, var(--color-text-primary))',
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                      lineHeight: 1.6,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
