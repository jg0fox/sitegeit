interface SiteSectionDividerProps {
  variant: 'none' | 'angled' | 'curved' | 'line'
}

export function SiteSectionDivider({ variant }: SiteSectionDividerProps) {
  if (variant === 'none') return null

  // All non-none variants render a clean horizontal line
  return (
    <div
      className="mx-auto px-4"
      style={{ maxWidth: 'var(--container-max-width, 1200px)' }}
    >
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
    </div>
  )
}
