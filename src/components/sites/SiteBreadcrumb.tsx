interface SiteBreadcrumbProps {
  items: { label: string; href?: string }[]
  basePath: string
  isEditorial?: boolean
}

export function SiteBreadcrumb({ items, basePath, isEditorial }: SiteBreadcrumbProps) {
  const allItems = [{ label: 'Home', href: basePath || '/' }, ...items]

  return (
    <nav
      aria-label="Breadcrumb"
      className={isEditorial ? 'mx-auto' : 'mx-auto px-4'}
      style={{ maxWidth: 'var(--container-max-width, 1280px)' }}
    >
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {allItems.map((item, i) => {
          const isLast = i === allItems.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '16px',
                    color: isEditorial
                      ? 'var(--ed-on-surface-variant, var(--color-text-secondary))'
                      : 'var(--color-text-secondary)',
                  }}
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  style={{
                    color: isEditorial
                      ? 'var(--ed-on-surface-variant, var(--color-text-secondary))'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="transition-colors hover:opacity-80"
                  style={{
                    color: isEditorial
                      ? 'var(--ed-primary, var(--color-primary))'
                      : 'var(--color-link, var(--color-primary))',
                  }}
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
