import { describe, it, expect } from 'vitest'
import { searchParamsSchema, addToPipelineSchema } from './schemas'

describe('searchParamsSchema', () => {
  it('validates correct search params', () => {
    const result = searchParamsSchema.safeParse({
      region: 'Austin, TX',
      category: 'plumber',
      radius_km: 15,
    })
    expect(result.success).toBe(true)
  })

  it('applies default radius_km', () => {
    const result = searchParamsSchema.parse({
      region: 'Austin, TX',
      category: 'plumber',
    })
    expect(result.radius_km).toBe(10)
  })

  it('rejects empty region', () => {
    const result = searchParamsSchema.safeParse({
      region: '',
      category: 'plumber',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty category', () => {
    const result = searchParamsSchema.safeParse({
      region: 'Austin, TX',
      category: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects radius out of range', () => {
    expect(
      searchParamsSchema.safeParse({
        region: 'Austin',
        category: 'plumber',
        radius_km: 0,
      }).success
    ).toBe(false)

    expect(
      searchParamsSchema.safeParse({
        region: 'Austin',
        category: 'plumber',
        radius_km: 51,
      }).success
    ).toBe(false)
  })

  it('validates with filters', () => {
    const result = searchParamsSchema.safeParse({
      region: 'Austin, TX',
      category: 'plumber',
      radius_km: 10,
      filters: {
        min_rating: 4,
        min_reviews: 10,
        website_status: ['none', 'dead'],
        has_phone: true,
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('addToPipelineSchema', () => {
  const validResult = {
    place_id: 'ChIJ123',
    name: "Joe's Plumbing",
    formatted_address: '123 Main St, Austin, TX',
    geometry: { lat: 30.2672, lng: -97.7431 },
    types: ['plumber'],
    website_status: 'none' as const,
  }

  it('validates correct add-to-pipeline input', () => {
    const result = addToPipelineSchema.safeParse({
      results: [validResult],
      category: 'plumber',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty results array', () => {
    const result = addToPipelineSchema.safeParse({
      results: [],
      category: 'plumber',
    })
    expect(result.success).toBe(false)
  })

  it('accepts results with optional fields', () => {
    const result = addToPipelineSchema.safeParse({
      results: [
        {
          ...validResult,
          rating: 4.5,
          user_ratings_total: 127,
          formatted_phone_number: '(512) 555-0123',
          website: 'https://example.com',
        },
      ],
      category: 'plumber',
    })
    expect(result.success).toBe(true)
  })
})
