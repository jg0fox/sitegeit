import type { ThemeConfig } from './index'

export const freshActive: ThemeConfig = {
  themeId: 'fresh-active',
  layoutVariant: 'authority',
  colors: {
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primaryLight: '#f0fdf4',
    accent: '#facc15',
    background: '#09090b',
    surface: '#18181b',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    border: '#27272a',
  },
  typography: {
    headingFont: "'Oswald', system-ui, sans-serif",
    bodyFont: "'DM Sans', system-ui, sans-serif",
    headingWeight: 700,
    headingTracking: '-0.01em',
    bodySize: '16px',
    scaleRatio: 1.333,
  },
  shape: {
    radiusSm: '2px',
    radiusMd: '4px',
    radiusLg: '6px',
    radiusButton: '4px',
    radiusCard: '6px',
  },
  spacing: {
    sectionGap: '4rem',
    cardPadding: '1.25rem',
    containerMaxWidth: '1200px',
  },
  motion: {
    durationNormal: '150ms',
    reducedMotion: true,
  },
}
