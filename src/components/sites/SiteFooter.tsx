interface SiteFooterProps {
  businessName: string
  phone: string | null
  address: string
  hours: Record<string, string> | null
  siteSlug?: string
}

export function SiteFooter({ businessName, phone, address, hours, siteSlug }: SiteFooterProps) {
  const currentYear = new Date().getFullYear()
  const basePath = siteSlug ? `/sites/${siteSlug}` : null

  return (
    <footer
      className="border-t px-4 py-10"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4" style={{ maxWidth: '1200px' }}>
        {/* Business info */}
        <div>
          <h3
            className="mb-3 text-lg font-bold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {businessName}
          </h3>
          {address && (
            <p className="mb-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {address}
            </p>
          )}
          {phone && (
            <p className="text-sm">
              <a href={`tel:${phone}`} style={{ color: 'var(--color-primary)' }}>
                {phone}
              </a>
            </p>
          )}
        </div>

        {/* Page links */}
        {basePath && (
          <div>
            <h3
              className="mb-3 text-sm font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Pages
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={basePath} className="transition-colors hover:underline" style={{ color: 'var(--color-text-primary)' }}>
                  Home
                </a>
              </li>
              <li>
                <a href={`${basePath}/about`} className="transition-colors hover:underline" style={{ color: 'var(--color-text-primary)' }}>
                  About
                </a>
              </li>
              <li>
                <a href={`${basePath}/contact`} className="transition-colors hover:underline" style={{ color: 'var(--color-text-primary)' }}>
                  Contact
                </a>
              </li>
              <li>
                <a href={`${basePath}/faq`} className="transition-colors hover:underline" style={{ color: 'var(--color-text-primary)' }}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        )}

        {/* Hours */}
        {hours && Object.keys(hours).length > 0 && (
          <div>
            <h3
              className="mb-3 text-sm font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Hours
            </h3>
            <dl className="space-y-1 text-sm">
              {Object.entries(hours).map(([day, time]) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt className="capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                    {day}
                  </dt>
                  <dd>{time}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Copyright */}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            &copy; {currentYear} {businessName}. All rights reserved.
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Website by{' '}
            <a href="https://sitegeit.com" style={{ color: 'var(--color-primary)' }}>
              Sitegeit
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
