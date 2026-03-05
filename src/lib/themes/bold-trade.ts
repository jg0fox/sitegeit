import type { ThemeConfig } from './index'

export const boldTrade: ThemeConfig = {
  themeId: 'bold-trade',
  layoutVariant: 'service-first',
  colors: {
    primary: '#1e40af',
    primaryHover: '#1e3a8a',
    primaryLight: '#eff6ff',
    accent: '#f97316',
    link: '#93b4ff',
    background: '#0f172a',
    surface: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#4a5e78',
    iconBg: 'rgba(249, 115, 22, 0.25)',
    starEmpty: '#475569',
    heroOverlay: 'rgba(15, 23, 42, 0.65)',
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
    durationNormal: '200ms',
    reducedMotion: true,
  },
  componentVariants: {
    card: 'accent-top',
    heroBackground: 'gradient',
    sectionDivider: 'angled',
    iconStyle: 'square-bg',
  },
  sectionBackgrounds: {
    primary: '#1e293b',
    default: '#0f172a',
    alternate: '#162036',
  },
}
