interface SiteServiceRelatedProps {
  services: { name: string; slug: string }[]
  siteSlug: string
}

export function SiteServiceRelated({ services, siteSlug }: SiteServiceRelatedProps) {
  if (services.length === 0) return null

  return (
    <section
      className="px-4"
      style={{
        paddingTop: 'var(--space-section, 5rem)',
        paddingBottom: 'var(--space-section, 5rem)',
      }}
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
          Related Services
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <a
              key={service.slug}
              href={`/sites/${siteSlug}/${service.slug}`}
              className="group flex items-center justify-between border p-4 transition-shadow hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <span
                className="text-sm font-medium sm:text-base"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {service.name}
              </span>
              <span
                className="material-symbols-outlined transition-transform group-hover:translate-x-0.5"
                style={{ fontSize: '20px', color: 'var(--color-primary)' }}
              >
                arrow_forward
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
