import { describe, it, expect } from 'vitest'
import {
  THEMES,
  getThemeForCategory,
  getLayoutForCategory,
  getThemeId,
  themeConfigToCSSVars,
} from './index'

describe('THEMES', () => {
  it('has all 8 themes registered', () => {
    expect(Object.keys(THEMES)).toHaveLength(8)
    expect(Object.keys(THEMES)).toEqual(
      expect.arrayContaining([
        'bold-trade',
        'soft-care',
        'warm-craft',
        'urban-edge',
        'clean-professional',
        'fresh-active',
        'natural-earth',
        'modern-minimal',
      ])
    )
  })

  it('each theme has required config fields', () => {
    for (const [id, theme] of Object.entries(THEMES)) {
      expect(theme.themeId).toBe(id)
      expect(theme.layoutVariant).toBeTruthy()

      // Colors
      expect(theme.colors.primary).toMatch(/^#[0-9a-f]{6}$/i)
      expect(theme.colors.primaryHover).toMatch(/^#[0-9a-f]{6}$/i)
      expect(theme.colors.background).toMatch(/^#[0-9a-f]{6}$/i)
      expect(theme.colors.textPrimary).toMatch(/^#[0-9a-f]{6}$/i)

      // Typography
      expect(theme.typography.headingFont).toBeTruthy()
      expect(theme.typography.bodyFont).toBeTruthy()
      expect(theme.typography.headingWeight).toBeGreaterThanOrEqual(400)
      expect(theme.typography.scaleRatio).toBeGreaterThan(1)

      // Shape
      expect(theme.shape.radiusSm).toBeTruthy()
      expect(theme.shape.radiusCard).toBeTruthy()

      // Spacing
      expect(theme.spacing.sectionGap).toBeTruthy()
      expect(theme.spacing.containerMaxWidth).toBeTruthy()

      // Motion
      expect(theme.motion.durationNormal).toBeTruthy()
      expect(typeof theme.motion.reducedMotion).toBe('boolean')
    }
  })
})

describe('getThemeForCategory', () => {
  it('returns bold-trade for plumber', () => {
    const theme = getThemeForCategory('plumber')
    expect(theme.themeId).toBe('bold-trade')
  })

  it('returns soft-care for dentist', () => {
    const theme = getThemeForCategory('dentist')
    expect(theme.themeId).toBe('soft-care')
  })

  it('returns warm-craft for bakery', () => {
    const theme = getThemeForCategory('bakery')
    expect(theme.themeId).toBe('warm-craft')
  })

  it('returns urban-edge for barber', () => {
    const theme = getThemeForCategory('barber')
    expect(theme.themeId).toBe('urban-edge')
  })

  it('returns clean-professional for lawyer', () => {
    const theme = getThemeForCategory('lawyer')
    expect(theme.themeId).toBe('clean-professional')
  })

  it('returns fresh-active for gym', () => {
    const theme = getThemeForCategory('gym')
    expect(theme.themeId).toBe('fresh-active')
  })

  it('returns natural-earth for landscaper', () => {
    const theme = getThemeForCategory('landscaper')
    expect(theme.themeId).toBe('natural-earth')
  })

  it('returns modern-minimal for photography', () => {
    const theme = getThemeForCategory('photography')
    expect(theme.themeId).toBe('modern-minimal')
  })

  it('defaults to clean-professional for unknown category', () => {
    const theme = getThemeForCategory('unknown_category')
    expect(theme.themeId).toBe('clean-professional')
  })
})

describe('getLayoutForCategory', () => {
  it('returns service-first for plumber', () => {
    expect(getLayoutForCategory('plumber')).toBe('service-first')
  })

  it('returns community for bakery', () => {
    expect(getLayoutForCategory('bakery')).toBe('community')
  })

  it('returns authority for dentist', () => {
    expect(getLayoutForCategory('dentist')).toBe('authority')
  })

  it('returns portfolio for photography', () => {
    expect(getLayoutForCategory('photography')).toBe('portfolio')
  })

  it('defaults to authority for unknown category', () => {
    expect(getLayoutForCategory('unknown')).toBe('authority')
  })
})

describe('getThemeId', () => {
  it('returns correct theme id', () => {
    expect(getThemeId('plumber')).toBe('bold-trade')
    expect(getThemeId('dentist')).toBe('soft-care')
    expect(getThemeId('unknown')).toBe('clean-professional')
  })
})

describe('themeConfigToCSSVars', () => {
  it('converts theme config to CSS custom properties', () => {
    const theme = THEMES['bold-trade']
    const vars = themeConfigToCSSVars(theme)

    expect(vars['--color-primary']).toBe(theme.colors.primary)
    expect(vars['--color-background']).toBe(theme.colors.background)
    expect(vars['--font-heading']).toBe(theme.typography.headingFont)
    expect(vars['--font-body']).toBe(theme.typography.bodyFont)
    expect(vars['--radius-card']).toBe(theme.shape.radiusCard)
    expect(vars['--space-section']).toBe(theme.spacing.sectionGap)
  })

  it('converts heading weight to string', () => {
    const theme = THEMES['bold-trade']
    const vars = themeConfigToCSSVars(theme)
    expect(vars['--font-weight-heading']).toBe(String(theme.typography.headingWeight))
  })
})
