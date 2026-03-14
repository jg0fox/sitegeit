import type { ThemeConfig } from './index'

export const boldTrade: ThemeConfig = {
  themeId: 'bold-trade',
  layoutVariant: 'service-first',
  colors: {
    primary: '#655560',
    primaryHover: '#4d4049',
    primaryLight: '#f5eef3',
    accent: '#a4969b',
    link: '#655560',
    background: '#fcf7ff',
    surface: '#ffffff',
    textPrimary: '#655560',
    textSecondary: '#878c8f',
    border: '#c4cad0',
    iconBg: 'rgba(101, 85, 96, 0.12)',
    starEmpty: '#c4cad0',
    heroOverlay: 'rgba(101, 85, 96, 0.65)',
  },
  typography: {
    headingFont: "'Oswald', system-ui, sans-serif",
    bodyFont: "'Source Sans 3', system-ui, sans-serif",
    headingWeight: 700,
    headingTracking: '-0.02em',
    bodySize: '16px',
    scaleRatio: 1.25,
  },
  shape: {
    radiusSm: '4px',
    radiusMd: '6px',
    radiusLg: '10px',
    radiusButton: '6px',
    radiusCard: '10px',
  },
  spacing: {
    sectionGap: '4rem',
    cardPadding: '1.25rem',
    containerMaxWidth: '1200px',
  },
  motion: {
    durationNormal: '200ms',
    reducedMotion: true,
  },
  componentVariants: {
    card: 'accent-top',
    heroBackground: 'gradient',
    sectionDivider: 'line',
    iconStyle: 'square-bg',
  },
  sectionBackgrounds: {
    primary: '#ffffff',
    default: '#fcf7ff',
    alternate: '#f3ecf0',
  },
}
