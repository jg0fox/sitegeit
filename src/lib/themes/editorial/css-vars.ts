import type { EditorialThemeConfig } from './index'

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

/**
 * Convert an EditorialThemeConfig to CSS custom properties.
 * These are injected as inline styles on the <body> element.
 *
 * Variable naming convention: --ed-{category}-{token}
 * (ed = editorial, keeps them distinct from legacy --color-* vars)
 */
export function editorialPaletteToCSSVars(config: EditorialThemeConfig): Record<string, string> {
  const p = config.palette

  return {
    // Surfaces (tonal layering hierarchy)
    '--ed-surface': p.surface,
    '--ed-surface-container-low': p.surfaceContainerLow,
    '--ed-surface-container-lowest': p.surfaceContainerLowest,
    '--ed-surface-container': p.surfaceContainer,
    '--ed-surface-container-high': p.surfaceContainerHigh,
    '--ed-surface-container-highest': p.surfaceContainerHighest,
    '--ed-surface-dim': p.surfaceDim,

    // Primary
    '--ed-primary': p.primary,
    '--ed-primary-rgb': hexToRgb(p.primary),
    '--ed-primary-container': p.primaryContainer,
    '--ed-primary-container-rgb': hexToRgb(p.primaryContainer),
    '--ed-on-primary-fixed': p.onPrimaryFixed,
    '--ed-on-primary-fixed-rgb': hexToRgb(p.onPrimaryFixed),
    '--ed-on-primary-container': p.onPrimaryContainer,

    // Secondary
    '--ed-secondary': p.secondary,
    '--ed-secondary-container': p.secondaryContainer,
    '--ed-secondary-container-rgb': hexToRgb(p.secondaryContainer),
    '--ed-secondary-fixed': p.secondaryFixed,
    '--ed-on-secondary-container': p.onSecondaryContainer,

    // Text
    '--ed-on-surface': p.onSurface,
    '--ed-on-surface-variant': p.onSurfaceVariant,

    // Utility
    '--ed-outline': p.outline,
    '--ed-outline-variant': p.outlineVariant,

    // Star rating
    '--ed-star-fill': p.starFill,

    // Typography (fixed for editorial system)
    '--ed-font-heading': config.typography.headingFont,
    '--ed-font-body': config.typography.bodyFont,

    // Shape
    '--ed-radius': config.shape.radiusDefault,
    '--ed-radius-lg': config.shape.radiusLg,
    '--ed-radius-xl': config.shape.radiusXl,
    '--ed-radius-full': config.shape.radiusFull,

    // =========================================================
    // Legacy compatibility layer — maps editorial tokens to the
    // old --color-* vars so existing components degrade gracefully
    // during the migration period.
    // =========================================================
    '--color-primary': p.onPrimaryFixed,
    '--color-primary-hover': p.primary,
    '--color-primary-light': p.primaryContainer,
    '--color-accent': p.secondaryContainer,
    '--color-accent-rgb': hexToRgb(p.secondaryContainer),
    '--color-primary-rgb': hexToRgb(p.onPrimaryFixed),
    '--color-link': p.primary,
    '--color-background': p.surface,
    '--color-surface': p.surfaceContainerLowest,
    '--color-text-primary': p.onSurface,
    '--color-text-secondary': p.onSurfaceVariant,
    '--color-border': p.outlineVariant,
    '--color-icon-bg': `rgba(${hexToRgb(p.primary)}, 0.12)`,
    '--color-star-empty': p.surfaceDim,
    '--color-hero-overlay': `rgba(${hexToRgb(p.onPrimaryFixed)}, 0.65)`,
    '--color-text-on-primary-light': p.onPrimaryContainer,
    '--color-text-secondary-on-primary-light': p.primary,
    '--color-section-primary': p.surfaceContainerLowest,
    '--color-section-default': p.surface,
    '--color-section-alternate': p.surfaceContainerLow,
    '--font-heading': config.typography.headingFont,
    '--font-body': config.typography.bodyFont,
    '--font-weight-heading': '700',
    '--tracking-heading': '-0.02em',
    '--radius-sm': '8px',
    '--radius-md': '1rem',
    '--radius-lg': '2rem',
    '--radius-button': config.shape.radiusFull,
    '--radius-card': config.shape.radiusLg,
    '--space-section': '6rem',
    '--container-max-width': '1280px',
  }
}
