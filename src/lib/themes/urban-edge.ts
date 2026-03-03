import type { ThemeConfig } from './index'

export const urbanEdge: ThemeConfig = {
  themeId: 'urban-edge',
  layoutVariant: 'community',
  colors: {
    primary: '#e11d48',
    primaryHover: '#be123c',
    primaryLight: '#fff1f2',
    accent: '#fbbf24',
    link: '#fb7185',
    background: '#09090b',
    surface: '#18181b',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    border: '#27272a',
  },
  typography: {
    headingFont: "'Bebas Neue', system-ui, sans-serif",
    bodyFont: "'Manrope', system-ui, sans-serif",
    headingWeight: 400,
    headingTracking: '0.02em',
    bodySize: '16px',
    scaleRatio: 1.333,
  },
  shape: {
    radiusSm: '0px',
    radiusMd: '2px',
    radiusLg: '4px',
    radiusButton: '2px',
    radiusCard: '4px',
  },
  spacing: {
    sectionGap: '3.5rem',
    cardPadding: '1.25rem',
    containerMaxWidth: '1200px',
  },
  motion: {
    durationNormal: '150ms',
    reducedMotion: true,
  },
}
