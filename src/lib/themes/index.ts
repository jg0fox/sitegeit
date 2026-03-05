import { boldTrade } from './bold-trade'
import { softCare } from './soft-care'
import { warmCraft } from './warm-craft'
import { urbanEdge } from './urban-edge'
import { cleanProfessional } from './clean-professional'
import { freshActive } from './fresh-active'
import { naturalEarth } from './natural-earth'
import { modernMinimal } from './modern-minimal'

export interface ThemeConfig {
  themeId: string
  layoutVariant: string
  colors: {
    primary: string
    primaryHover: string
    primaryLight: string
    accent: string
    link: string
    background: string
    surface: string
    textPrimary: string
    textSecondary: string
    border: string
    iconBg?: string
    starEmpty?: string
    heroOverlay?: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    headingWeight: number
    headingTracking: string
    bodySize: string
    scaleRatio: number
  }
  shape: {
    radiusSm: string
    radiusMd: string
    radiusLg: string
    radiusButton: string
    radiusCard: string
  }
  spacing: {
    sectionGap: string
    cardPadding: string
    containerMaxWidth: string
  }
  motion: {
    durationNormal: string
    reducedMotion: boolean
  }
  componentVariants: {
    card: 'flat' | 'bordered' | 'accent-top' | 'accent-left'
    heroBackground: 'solid' | 'gradient' | 'pattern'
    sectionDivider: 'none' | 'angled' | 'curved' | 'line'
    iconStyle: 'bare' | 'circle-bg' | 'square-bg'
  }
  sectionBackgrounds: {
    primary: string
    default: string
    alternate: string
  }
}

export const THEMES: Record<string, ThemeConfig> = {
  'bold-trade': boldTrade,
  'soft-care': softCare,
  'warm-craft': warmCraft,
  'urban-edge': urbanEdge,
  'clean-professional': cleanProfessional,
  'fresh-active': freshActive,
  'natural-earth': naturalEarth,
  'modern-minimal': modernMinimal,
}

const CATEGORY_THEME_MAP: Record<string, string> = {
  plumber: 'bold-trade',
  electrician: 'bold-trade',
  hvac: 'bold-trade',
  roofer: 'bold-trade',
  general_contractor: 'bold-trade',
  handyman: 'bold-trade',
  auto_repair: 'bold-trade',
  towing: 'bold-trade',
  bakery: 'warm-craft',
  restaurant: 'warm-craft',
  cafe: 'warm-craft',
  bar: 'warm-craft',
  florist: 'warm-craft',
  dentist: 'soft-care',
  chiropractor: 'soft-care',
  veterinarian: 'soft-care',
  spa: 'soft-care',
  yoga: 'soft-care',
  cleaning: 'soft-care',
  lawyer: 'clean-professional',
  accounting: 'clean-professional',
  real_estate: 'clean-professional',
  insurance: 'clean-professional',
  barber: 'urban-edge',
  hair_salon: 'modern-minimal',
  nail_salon: 'modern-minimal',
  gym: 'fresh-active',
  landscaper: 'natural-earth',
  photography: 'modern-minimal',
  pet_groomer: 'soft-care',
}

const CATEGORY_LAYOUT_MAP: Record<string, string> = {
  plumber: 'service-first',
  electrician: 'service-first',
  hvac: 'service-first',
  roofer: 'service-first',
  general_contractor: 'service-first',
  handyman: 'service-first',
  auto_repair: 'service-first',
  cleaning: 'service-first',
  bakery: 'community',
  restaurant: 'community',
  cafe: 'community',
  bar: 'community',
  florist: 'community',
  barber: 'community',
  hair_salon: 'community',
  dentist: 'authority',
  chiropractor: 'authority',
  lawyer: 'authority',
  accounting: 'authority',
  real_estate: 'authority',
  insurance: 'authority',
  veterinarian: 'authority',
  photography: 'portfolio',
  landscaper: 'portfolio',
  spa: 'authority',
  gym: 'authority',
  yoga: 'authority',
}

export function getThemeForCategory(categorySlug: string): ThemeConfig {
  const themeId = CATEGORY_THEME_MAP[categorySlug] || 'clean-professional'
  return THEMES[themeId]
}

export function getLayoutForCategory(categorySlug: string): string {
  return CATEGORY_LAYOUT_MAP[categorySlug] || 'authority'
}

export function getThemeId(categorySlug: string): string {
  return CATEGORY_THEME_MAP[categorySlug] || 'clean-professional'
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

/** Returns true if the hex color has relative luminance > 0.5 (i.e. is visually light). */
export function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

export function themeConfigToCSSVars(config: ThemeConfig): Record<string, string> {
  const isDark = !isLightColor(config.colors.background)

  // Derive icon background: explicit value, or accent-tinted translucent bg
  const iconBg = config.colors.iconBg ||
    (isDark
      ? `rgba(${hexToRgb(config.colors.accent)}, 0.40)`
      : `rgba(${hexToRgb(config.colors.primary)}, 0.12)`)

  // Derive empty star fill color
  const starEmpty = config.colors.starEmpty ||
    (isDark ? '#475569' : '#d1d5db')

  // Derive hero image overlay — must be dark enough for white text readability
  // Dark themes: darken with background color. Light themes: use black overlay.
  const heroOverlay = config.colors.heroOverlay ||
    (isDark
      ? `rgba(${hexToRgb(config.colors.background)}, 0.70)`
      : 'rgba(0, 0, 0, 0.55)')

  return {
    '--color-primary': config.colors.primary,
    '--color-primary-hover': config.colors.primaryHover,
    '--color-primary-light': config.colors.primaryLight,
    '--color-accent': config.colors.accent,
    '--color-accent-rgb': hexToRgb(config.colors.accent),
    '--color-primary-rgb': hexToRgb(config.colors.primary),
    '--color-link': config.colors.link,
    '--color-background': config.colors.background,
    '--color-surface': config.colors.surface,
    '--color-text-primary': config.colors.textPrimary,
    '--color-text-secondary': config.colors.textSecondary,
    '--color-border': config.colors.border,
    '--color-icon-bg': iconBg,
    '--color-star-empty': starEmpty,
    '--color-hero-overlay': heroOverlay,
    // Text colors for sections using primaryLight as background (always light)
    '--color-text-on-primary-light': config.colors.primary,
    '--color-text-secondary-on-primary-light': config.colors.primaryHover,
    '--color-section-primary': config.sectionBackgrounds.primary,
    '--color-section-default': config.sectionBackgrounds.default,
    '--color-section-alternate': config.sectionBackgrounds.alternate,
    '--font-heading': config.typography.headingFont,
    '--font-body': config.typography.bodyFont,
    '--font-weight-heading': String(config.typography.headingWeight),
    '--tracking-heading': config.typography.headingTracking,
    '--radius-sm': config.shape.radiusSm,
    '--radius-md': config.shape.radiusMd,
    '--radius-lg': config.shape.radiusLg,
    '--radius-button': config.shape.radiusButton,
    '--radius-card': config.shape.radiusCard,
    '--space-section': config.spacing.sectionGap,
    '--container-max-width': config.spacing.containerMaxWidth,
  }
}
