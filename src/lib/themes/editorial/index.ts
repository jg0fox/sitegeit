/**
 * Editorial Design System — "The Pristine Editorial"
 *
 * A single unified design system with parameterized color palettes
 * per business category. Replaces the previous 8-theme system.
 *
 * Design principles:
 * - No 1px borders — separation via tonal layering only
 * - Glassmorphism navigation (70% opacity + backdrop-blur)
 * - Rounded-full buttons with hover lift
 * - Bento grid layouts (12-col asymmetric)
 * - Epilogue + Plus Jakarta Sans typography
 * - Ambient shadows (40-60px blur, 4-8% opacity, tinted)
 */

export interface EditorialPalette {
  paletteId: string

  // Core surfaces (4-level hierarchy for tonal layering)
  surface: string              // Main page background (e.g. #fdf9f2)
  surfaceContainerLow: string  // Section backgrounds (e.g. #f7f3ec)
  surfaceContainerLowest: string // Cards on sections (e.g. #ffffff)
  surfaceContainer: string     // Input fields, tags (e.g. #f1ede6)
  surfaceContainerHigh: string // Hover states (e.g. #ebe8e1)
  surfaceContainerHighest: string // Nested containers (e.g. #e6e2db)
  surfaceDim: string           // Disabled states (e.g. #dddad3)

  // Primary (authority color)
  primary: string              // Main brand color (e.g. #535f71)
  primaryContainer: string     // Featured cards/highlights (e.g. #d8e4fa)
  onPrimaryFixed: string       // Dark CTA button bg (e.g. #101c2c)
  onPrimaryContainer: string   // Text on primary container (e.g. #0e1d2e)

  // Secondary (accent/warmth color)
  secondary: string            // Accent tone (e.g. #775a00)
  secondaryContainer: string   // Tags, badges — "sparkle tag" (e.g. #fcc740)
  secondaryFixed: string       // Decorative underlines (e.g. #ffdf9a)
  onSecondaryContainer: string // Text on secondary container (e.g. #6f5400)

  // Text
  onSurface: string            // Primary text (e.g. #1c1c18)
  onSurfaceVariant: string     // Secondary text (e.g. #44474c)

  // Utility
  outline: string              // Ghost borders if needed (e.g. #75777d)
  outlineVariant: string       // Very subtle borders (e.g. #c5c6cd)

  // Star rating color (derived from secondary usually)
  starFill: string             // Filled star color
}

export interface EditorialThemeConfig {
  designSystem: 'editorial'
  paletteId: string
  palette: EditorialPalette
  typography: {
    headingFont: string        // Always Epilogue
    bodyFont: string           // Always Plus Jakarta Sans
    headingWeights: string     // '300;400;600;700;800'
    bodyWeights: string        // '300;400;500;600'
  }
  shape: {
    radiusDefault: string      // '1rem' (16px)
    radiusLg: string           // '2rem' (32px)
    radiusXl: string           // '3rem' (48px)
    radiusFull: string         // '9999px'
  }
  cssVars: Record<string, string>
}

import { warmNeutral } from './palettes/warm-neutral'
import { coolTrust } from './palettes/cool-trust'
import { earthCraft } from './palettes/earth-craft'
import { boldSlate } from './palettes/bold-slate'
import { freshGreen } from './palettes/fresh-green'
import { modernInk } from './palettes/modern-ink'
import { editorialPaletteToCSSVars } from './css-vars'

export const EDITORIAL_PALETTES: Record<string, EditorialPalette> = {
  'warm-neutral': warmNeutral,
  'cool-trust': coolTrust,
  'earth-craft': earthCraft,
  'bold-slate': boldSlate,
  'fresh-green': freshGreen,
  'modern-ink': modernInk,
}

/** Map business categories to editorial palette IDs */
export const CATEGORY_EDITORIAL_PALETTE_MAP: Record<string, string> = {
  // warm-neutral — cleaning, spa, yoga, wellness, pet care
  cleaning: 'warm-neutral',
  spa: 'warm-neutral',
  yoga: 'warm-neutral',
  pet_groomer: 'warm-neutral',
  chiropractor: 'warm-neutral',
  veterinarian: 'warm-neutral',
  dentist: 'warm-neutral',

  // cool-trust — professional services
  lawyer: 'cool-trust',
  accounting: 'cool-trust',
  real_estate: 'cool-trust',
  insurance: 'cool-trust',

  // earth-craft — food, hospitality, community
  bakery: 'earth-craft',
  restaurant: 'earth-craft',
  cafe: 'earth-craft',
  bar: 'earth-craft',
  florist: 'earth-craft',

  // bold-slate — trades, automotive
  plumber: 'bold-slate',
  electrician: 'bold-slate',
  hvac: 'bold-slate',
  roofer: 'bold-slate',
  general_contractor: 'bold-slate',
  handyman: 'bold-slate',
  auto_repair: 'bold-slate',
  towing: 'bold-slate',

  // fresh-green — fitness, outdoor
  gym: 'fresh-green',
  landscaper: 'fresh-green',

  // modern-ink — creative, lifestyle
  barber: 'modern-ink',
  hair_salon: 'modern-ink',
  nail_salon: 'modern-ink',
  photography: 'modern-ink',
}

const DEFAULT_PALETTE_ID = 'warm-neutral'

export function getEditorialPaletteForCategory(categorySlug: string): EditorialPalette {
  const paletteId = CATEGORY_EDITORIAL_PALETTE_MAP[categorySlug] || DEFAULT_PALETTE_ID
  return EDITORIAL_PALETTES[paletteId]
}

export function getEditorialPaletteId(categorySlug: string): string {
  return CATEGORY_EDITORIAL_PALETTE_MAP[categorySlug] || DEFAULT_PALETTE_ID
}

export function buildEditorialThemeConfig(categorySlug: string): EditorialThemeConfig {
  const palette = getEditorialPaletteForCategory(categorySlug)
  const config: EditorialThemeConfig = {
    designSystem: 'editorial',
    paletteId: palette.paletteId,
    palette,
    typography: {
      headingFont: "'Epilogue', system-ui, sans-serif",
      bodyFont: "'Plus Jakarta Sans', system-ui, sans-serif",
      headingWeights: '300;400;600;700;800',
      bodyWeights: '300;400;500;600',
    },
    shape: {
      radiusDefault: '1rem',
      radiusLg: '2rem',
      radiusXl: '3rem',
      radiusFull: '9999px',
    },
    cssVars: {},
  }
  config.cssVars = editorialPaletteToCSSVars(config)
  return config
}
