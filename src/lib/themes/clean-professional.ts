import type { ThemeConfig } from './index'

export const cleanProfessional: ThemeConfig = {
  themeId: 'clean-professional',
  layoutVariant: 'authority',
  colors: {
    primary: '#1e3a5f',
    primaryHover: '#162d4a',
    primaryLight: '#f0f4f8',
    accent: '#d4a843',
    link: '#1e3a5f',
    background: '#ffffff',
    surface: '#f8f9fa',
    textPrimary: '#1a1a2e',
    textSecondary: '#4a5568',
    border: '#e2e8f0',
  },
  typography: {
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'Source Sans 3', system-ui, sans-serif",
    headingWeight: 700,
    headingTracking: '-0.01em',
    bodySize: '16px',
    scaleRatio: 1.25,
  },
  shape: {
    radiusSm: '4px',
    radiusMd: '6px',
    radiusLg: '8px',
    radiusButton: '6px',
    radiusCard: '8px',
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
