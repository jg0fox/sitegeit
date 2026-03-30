interface SiteSectionDividerProps {
  variant: 'none' | 'angled' | 'curved' | 'line'
  isEditorial?: boolean
}

export function SiteSectionDivider({ variant, isEditorial }: SiteSectionDividerProps) {
  // Editorial: no dividers — tonal layering handles separation
  if (isEditorial) return null
  if (variant === 'none') return null

  return (
    <div className="mx-auto px-4" style={{ maxWidth: 'var(--container-max-width, 1200px)' }}>
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
    </div>
  )
}
