import type { ThemeConfig } from './index'

export const warmCraft: ThemeConfig = {
  themeId: 'warm-craft',
  layoutVariant: 'community',
  colors: {
    primary: '#c2410c',
    primaryHover: '#9a3412',
    primaryLight: '#fff7ed',
    accent: '#fbbf24',
    background: '#fffbeb',
    surface: '#fef3c7',
    textPrimary: '#451a03',
    textSecondary: '#78350f',
    border: '#fcd34d',
  },
  typography: {
    headingFont: "'Fraunces', Georgia, serif",
    bodyFont: "'Source Sans 3', system-ui, sans-serif",
    headingWeight: 700,
    headingTracking: '-0.01em',
    bodySize: '16px',
    scaleRatio: 1.2,
  },
  shape: {
    radiusSm: '6px',
    radiusMd: '10px',
    radiusLg: '14px',
    radiusButton: '10px',
    radiusCard: '14px',
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
