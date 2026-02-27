import type { ThemeConfig } from './index'

export const naturalEarth: ThemeConfig = {
  themeId: 'natural-earth',
  layoutVariant: 'portfolio',
  colors: {
    primary: '#15803d',
    primaryHover: '#166534',
    primaryLight: '#f0fdf4',
    accent: '#a16207',
    background: '#fefce8',
    surface: '#f5f0e8',
    textPrimary: '#1c1917',
    textSecondary: '#57534e',
    border: '#d6d3d1',
  },
  typography: {
    headingFont: "'Work Sans', system-ui, sans-serif",
    bodyFont: "'Source Sans 3', system-ui, sans-serif",
    headingWeight: 600,
    headingTracking: '-0.01em',
    bodySize: '16px',
    scaleRatio: 1.2,
  },
  shape: {
    radiusSm: '6px',
    radiusMd: '8px',
    radiusLg: '12px',
    radiusButton: '8px',
    radiusCard: '12px',
  },
  spacing: {
    sectionGap: '5rem',
    cardPadding: '1.5rem',
    containerMaxWidth: '1100px',
  },
  motion: {
    durationNormal: '250ms',
    reducedMotion: false,
  },
}
