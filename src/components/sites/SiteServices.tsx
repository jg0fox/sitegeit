interface Service {
  name: string
  description: string
  icon_suggestion: string
}

interface SiteServicesProps {
  heading: string
  services: Service[]
  siteSlug?: string
  servicePageSlugs?: Record<string, string> // service name → slug
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function SiteServices({ heading, services, siteSlug, servicePageSlugs }: SiteServicesProps) {
  return (
    <section
      id="services"
      className="px-4"
      style={{ paddingTop: 'var(--space-section, 5rem)', paddingBottom: 'var(--space-section, 5rem)' }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
        <h2
          className="mb-8 text-center text-2xl sm:text-3xl"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading, 700)',
            letterSpacing: 'var(--tracking-heading, -0.01em)',
          }}
        >
          {heading}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const serviceSlug = servicePageSlugs?.[service.name] ?? toSlug(service.name)
            const href = siteSlug ? `/sites/${siteSlug}/${serviceSlug}` : undefined
            const cardContent = (
              <>
                <span
                  className="material-symbols-outlined mb-3 block"
                  style={{ fontSize: '32px', color: 'var(--color-primary)' }}
                >
                  {service.icon_suggestion}
                </span>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {service.name}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {service.description}
                </p>
                {href && (
                  <span
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: 'var(--color-link, var(--color-primary))' }}
                  >
                    Learn more
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      arrow_forward
                    </span>
                  </span>
                )}
              </>
            )

            return href ? (
              <a
                key={service.name}
                href={href}
                className="block border p-6 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {cardContent}
              </a>
            ) : (
              <div
                key={service.name}
                className="border p-6 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                {cardContent}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
