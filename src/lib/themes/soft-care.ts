import type { ThemeConfig } from './index'

export const softCare: ThemeConfig = {
  themeId: 'soft-care',
  layoutVariant: 'authority',
  colors: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryLight: '#f0f9ff',
    accent: '#99f6e4',
    background: '#ffffff',
    surface: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
  typography: {
    headingFont: "'Outfit', system-ui, sans-serif",
    bodyFont: "'Source Sans 3', system-ui, sans-serif",
    headingWeight: 600,
    headingTracking: '-0.01em',
    bodySize: '16px',
    scaleRatio: 1.25,
  },
  shape: {
    radiusSm: '8px',
    radiusMd: '12px',
    radiusLg: '16px',
    radiusButton: '12px',
    radiusCard: '16px',
  },
  spacing: {
    sectionGap: '6rem',
    cardPadding: '1.5rem',
    containerMaxWidth: '1100px',
  },
  motion: {
    durationNormal: '300ms',
    reducedMotion: false,
  },
}
