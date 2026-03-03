import { describe, it, expect } from 'vitest'
import { getSchemaType, buildLocalBusinessSchema, buildServiceSchema } from './schema-org'

describe('getSchemaType', () => {
  it('returns category-specific Schema.org types', () => {
    expect(getSchemaType('auto_repair')).toBe('AutoRepair')
    expect(getSchemaType('bakery')).toBe('Bakery')
    expect(getSchemaType('dentist')).toBe('Dentist')
    expect(getSchemaType('plumber')).toBe('Plumber')
    expect(getSchemaType('lawyer')).toBe('LegalService')
    expect(getSchemaType('barber')).toBe('BarberShop')
    expect(getSchemaType('landscaper')).toBe('LandscapingBusiness')
  })

  it('returns LocalBusiness for unknown categories', () => {
    expect(getSchemaType('unknown')).toBe('LocalBusiness')
    expect(getSchemaType('')).toBe('LocalBusiness')
  })
})

describe('buildLocalBusinessSchema', () => {
  it('builds complete schema with all fields', () => {
    const schema = buildLocalBusinessSchema({
      businessName: "Joe's Plumbing",
      phone: '+13035550123',
      address: {
        street: '1234 Main St',
        city: 'Denver',
        state: 'CO',
        zip: '80204',
      },
      categorySlug: 'plumber',
      rating: 4.8,
      reviewCount: 127,
      description: 'Reliable plumbing services in Denver',
    })

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Plumber')
    expect(schema.name).toBe("Joe's Plumbing")
    expect(schema.telephone).toBe('+13035550123')
    expect(schema.description).toBe('Reliable plumbing services in Denver')
    expect((schema.address as Record<string, string>)['@type']).toBe('PostalAddress')
    expect((schema.address as Record<string, string>).addressLocality).toBe('Denver')
    expect((schema.aggregateRating as Record<string, unknown>).ratingValue).toBe(4.8)
    expect((schema.aggregateRating as Record<string, unknown>).reviewCount).toBe(127)
  })

  it('omits optional fields when not provided', () => {
    const schema = buildLocalBusinessSchema({
      businessName: 'Test Biz',
      categorySlug: 'unknown',
    })

    expect(schema['@type']).toBe('LocalBusiness')
    expect(schema.name).toBe('Test Biz')
    expect(schema.telephone).toBeUndefined()
    expect(schema.address).toBeUndefined()
    expect(schema.aggregateRating).toBeUndefined()
  })
})

describe('buildServiceSchema', () => {
  it('builds a Service schema', () => {
    const schema = buildServiceSchema({
      serviceName: 'Drain Cleaning in Denver, CO',
      description: 'Professional drain cleaning services.',
      businessName: "Joe's Plumbing",
    })

    expect(schema['@type']).toBe('Service')
    expect(schema.name).toBe('Drain Cleaning in Denver, CO')
    expect(schema.description).toBe('Professional drain cleaning services.')
    expect((schema.provider as Record<string, string>).name).toBe("Joe's Plumbing")
  })
})
