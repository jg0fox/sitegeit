import type { ThemeConfig } from './index'

export const modernMinimal: ThemeConfig = {
  themeId: 'modern-minimal',
  layoutVariant: 'portfolio',
  colors: {
    primary: '#171717',
    primaryHover: '#0a0a0a',
    primaryLight: '#f5f5f5',
    accent: '#a3a3a3',
    background: '#ffffff',
    surface: '#fafafa',
    textPrimary: '#0a0a0a',
    textSecondary: '#737373',
    border: '#e5e5e5',
  },
  typography: {
    headingFont: "'Sora', system-ui, sans-serif",
    bodyFont: "'Inter', system-ui, sans-serif",
    headingWeight: 600,
    headingTracking: '-0.02em',
    bodySize: '16px',
    scaleRatio: 1.414,
  },
  shape: {
    radiusSm: '4px',
    radiusMd: '6px',
    radiusLg: '8px',
    radiusButton: '6px',
    radiusCard: '8px',
  },
  spacing: {
    sectionGap: '6rem',
    cardPadding: '1.5rem',
    containerMaxWidth: '1000px',
  },
  motion: {
    durationNormal: '200ms',
    reducedMotion: false,
  },
}
