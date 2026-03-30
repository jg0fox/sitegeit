const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function sortHours(hours: Record<string, string>): [string, string][] {
  return Object.entries(hours).sort(([a], [b]) => {
    const ai = DAY_ORDER.indexOf(a.toLowerCase())
    const bi = DAY_ORDER.indexOf(b.toLowerCase())
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

interface SiteFooterProps {
  businessName: string
  phone: string | null
  address: string
  hours: Record<string, string> | null
  basePath?: string
  isEditorial?: boolean
}

export function SiteFooter({ businessName, phone, address, hours, basePath, isEditorial }: SiteFooterProps) {
  const currentYear = new Date().getFullYear()
  const homePath = basePath != null ? (basePath || '/') : null

  // =========================================================
  // Editorial rendering — no borders, tonal bg, generous spacing
  // =========================================================
  if (isEditorial) {
    return (
      <footer
        className="px-6 md:px-8"
        style={{
          paddingTop: 'clamp(4rem, 8vw, 5rem)',
          paddingBottom: 'clamp(2rem, 4vw, 3rem)',
          backgroundColor: 'var(--ed-surface-container-low, var(--color-section-alternate))',
        }}
      >
        <div
          className="mx-auto grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
          style={{ maxWidth: 'var(--container-max-width, 1280px)' }}
        >
          {/* Business info */}
          <div>
            <h3
              className="mb-4 text-lg font-bold"
              style={{
                fontFamily: 'var(--ed-font-heading, var(--font-heading))',
                color: 'var(--ed-on-surface, var(--color-text-primary))',
                letterSpacing: '-0.01em',
              }}
            >
              {businessName}
            </h3>
            {address && (
              <p className="mb-2 text-sm" style={{ color: 'var(--ed-on-surface-variant, var(--color-text-secondary))', lineHeight: 1.6 }}>
                {address}
              </p>
            )}
            {phone && (
              <p className="text-sm">
                <a
                  href={`tel:${phone}`}
                  style={{ color: 'var(--ed-primary, var(--color-primary))' }}
                >
                  {phone}
                </a>
              </p>
            )}
          </div>

          {/* Page links */}
          {homePath && (
            <div>
              <h3
                className="mb-4 text-xs font-semibold uppercase"
                style={{
                  color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                  letterSpacing: '0.05em',
                }}
              >
                Pages
              </h3>
              <ul className="space-y-0 text-sm">
                {[
                  { label: 'Home', href: homePath },
                  { label: 'About', href: `${basePath}/about` },
                  { label: 'Contact', href: `${basePath}/contact` },
                  { label: 'FAQ', href: `${basePath}/faq` },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block py-2 transition-colors hover:opacity-80"
                      style={{ color: 'var(--ed-on-surface, var(--color-text-primary))' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hours */}
          {hours && Object.keys(hours).length > 0 && (
            <div>
              <h3
                className="mb-4 text-xs font-semibold uppercase"
                style={{
                  color: 'var(--ed-on-surface-variant, var(--color-text-secondary))',
                  letterSpacing: '0.05em',
                }}
              >
                Hours
              </h3>
              <dl className="space-y-1 text-sm">
                {sortHours(hours).map(([day, time]) => (
                  <div key={day} className="flex justify-between gap-4">
                    <dt className="capitalize" style={{ color: 'var(--ed-on-surface-variant, var(--color-text-secondary))' }}>{day}</dt>
                    <dd style={{ color: 'var(--ed-on-surface, var(--color-text-primary))' }}>{time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Copyright */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xs" style={{ color: 'var(--ed-on-surface-variant, var(--color-text-secondary))' }}>
              &copy; {currentYear} {businessName}. All rights reserved.
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--ed-on-surface-variant, var(--color-text-secondary))' }}>
              Website by{' '}
              <a
                href="https://simpleinstantsite.com"
                style={{
                  color: 'var(--ed-primary, var(--color-primary))',
                  borderBottom: '1px solid var(--ed-secondary-fixed, var(--color-accent))',
                }}
              >
                Simple Instant Site
              </a>
            </p>
          </div>
        </div>
      </footer>
    )
  }

  // =========================================================
  // Legacy rendering — unchanged
  // =========================================================
  return (
    <footer className="border-t px-4 py-10" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4" style={{ maxWidth: '1200px' }}>
        <div>
          <h3 className="mb-3 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{businessName}</h3>
          {address && <p className="mb-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{address}</p>}
          {phone && <p className="text-sm"><a href={`tel:${phone}`} style={{ color: 'var(--color-link, var(--color-primary))' }}>{phone}</a></p>}
        </div>
        {homePath && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Pages</h3>
            <ul className="space-y-0 text-sm">
              <li><a href={homePath} className="inline-block py-2 transition-colors hover:underline" style={{ color: 'var(--color-text-primary)' }}>Home</a></li>
              <li><a href={`${basePath}/about`} className="inline-block py-2 transition-colors hover:underline" style={{ color: 'var(--color-text-primary)' }}>About</a></li>
              <li><a href={`${basePath}/contact`} className="inline-block py-2 transition-colors hover:underline" style={{ color: 'var(--color-text-primary)' }}>Contact</a></li>
              <li><a href={`${basePath}/faq`} className="inline-block py-2 transition-colors hover:underline" style={{ color: 'var(--color-text-primary)' }}>FAQ</a></li>
            </ul>
          </div>
        )}
        {hours && Object.keys(hours).length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Hours</h3>
            <dl className="space-y-1 text-sm">
              {sortHours(hours).map(([day, time]) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt className="capitalize" style={{ color: 'var(--color-text-secondary)' }}>{day}</dt>
                  <dd>{time}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>&copy; {currentYear} {businessName}. All rights reserved.</p>
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Website by{' '}<a href="https://simpleinstantsite.com" style={{ color: 'var(--color-link, var(--color-primary))' }}>Simple Instant Site</a></p>
        </div>
      </div>
    </footer>
  )
}
