interface SiteBreadcrumbProps {
  items: { label: string; href?: string }[]
  siteSlug: string
}

export function SiteBreadcrumb({ items, siteSlug }: SiteBreadcrumbProps) {
  const allItems = [{ label: 'Home', href: `/sites/${siteSlug}` }, ...items]

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto px-4"
      style={{ maxWidth: 'var(--container-max-width, 1200px)' }}
    >
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {allItems.map((item, i) => {
          const isLast = i === allItems.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="transition-colors hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
