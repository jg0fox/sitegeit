import { describe, it, expect } from 'vitest'
import { sanitizeIconName } from './sanitize-icon'

describe('sanitizeIconName', () => {
  it('passes through valid Material Symbol names', () => {
    expect(sanitizeIconName('plumbing')).toBe('plumbing')
    expect(sanitizeIconName('bakery_dining')).toBe('bakery_dining')
    expect(sanitizeIconName('check_circle')).toBe('check_circle')
    expect(sanitizeIconName('directions_car')).toBe('directions_car')
  })

  it('normalizes case and whitespace', () => {
    expect(sanitizeIconName('  Plumbing  ')).toBe('plumbing')
    expect(sanitizeIconName('BAKERY_DINING')).toBe('bakery_dining')
  })

  it('converts spaces/hyphens to underscores', () => {
    expect(sanitizeIconName('check circle')).toBe('check_circle')
    expect(sanitizeIconName('bakery-dining')).toBe('bakery_dining')
  })

  it('maps verbose descriptions to valid icons', () => {
    expect(sanitizeIconName('A round loaf of artisan bread')).toBe('bakery_dining')
    expect(sanitizeIconName('wrench and pipe for plumbing')).toBe('build')
    expect(sanitizeIconName('a cute dog sitting')).toBe('pets')
    expect(sanitizeIconName('electric wiring services')).toBe('electrical_services')
  })

  it('returns fallback for completely unrecognizable input', () => {
    expect(sanitizeIconName('a beautiful abstract rendering of nature')).toBe('star')
    expect(sanitizeIconName('something with no keywords whatsoever')).toBe('star')
    expect(sanitizeIconName('', 'verified')).toBe('verified')
  })

  it('returns fallback for null/undefined-like input', () => {
    expect(sanitizeIconName('')).toBe('star')
    expect(sanitizeIconName(null as unknown as string)).toBe('star')
  })

  it('uses custom fallback when provided', () => {
    expect(sanitizeIconName('completely unrecognizable input here', 'verified')).toBe('verified')
  })

  it('passes through structurally valid icon names without keyword matching', () => {
    // Short underscore names should pass through even if not in keyword map
    expect(sanitizeIconName('local_cafe')).toBe('local_cafe')
    expect(sanitizeIconName('thumb_up')).toBe('thumb_up')
  })

  it('converts hyphenated names to underscores', () => {
    expect(sanitizeIconName('check-circle')).toBe('check_circle')
    expect(sanitizeIconName('local-shipping')).toBe('local_shipping')
  })
})
