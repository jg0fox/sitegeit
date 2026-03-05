import type { ThemeConfig } from './index'

export const freshActive: ThemeConfig = {
  themeId: 'fresh-active',
  layoutVariant: 'authority',
  colors: {
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primaryLight: '#f0fdf4',
    accent: '#facc15',
    link: '#4ade80',
    background: '#09090b',
    surface: '#18181b',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    border: '#3f3f46',
    iconBg: 'rgba(250, 204, 21, 0.20)',
    starEmpty: '#52525b',
    heroOverlay: 'rgba(9, 9, 11, 0.65)',
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
  componentVariants: {
    card: 'accent-top',
    heroBackground: 'gradient',
    sectionDivider: 'angled',
    iconStyle: 'square-bg',
  },
  sectionBackgrounds: {
    primary: '#18181b',
    default: '#09090b',
    alternate: '#111113',
  },
}
