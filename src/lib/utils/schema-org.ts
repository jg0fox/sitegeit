/**
 * Schema.org LocalBusiness @type mapping by business category.
 * Used for JSON-LD structured data on generated sites.
 *
 * Reference: https://schema.org/LocalBusiness subtypes
 */

const CATEGORY_SCHEMA_TYPE: Record<string, string> = {
  // Trades
  plumber: 'Plumber',
  electrician: 'Electrician',
  hvac: 'HVACBusiness',
  roofer: 'RoofingContractor',
  general_contractor: 'GeneralContractor',
  handyman: 'HomeAndConstructionBusiness',
  auto_repair: 'AutoRepair',
  towing: 'AutoRepair',
  // Food & Hospitality
  bakery: 'Bakery',
  restaurant: 'Restaurant',
  cafe: 'CafeOrCoffeeShop',
  bar: 'BarOrPub',
  florist: 'Florist',
  // Health & Wellness
  dentist: 'Dentist',
  chiropractor: 'Chiropractor',
  veterinarian: 'VeterinaryCare',
  spa: 'DaySpa',
  yoga: 'HealthClub',
  cleaning: 'HousekeepingService',
  pet_groomer: 'PetStore',
  // Professional
  lawyer: 'LegalService',
  accounting: 'AccountingService',
  real_estate: 'RealEstateAgent',
  insurance: 'InsuranceAgency',
  // Lifestyle
  barber: 'BarberShop',
  hair_salon: 'HairSalon',
  nail_salon: 'NailSalon',
  gym: 'HealthClub',
  // Creative
  landscaper: 'LandscapingBusiness',
  photography: 'Photographer',
}

export function getSchemaType(categorySlug: string): string {
  return CATEGORY_SCHEMA_TYPE[categorySlug] || 'LocalBusiness'
}

interface SchemaInput {
  businessName: string
  phone?: string | null
  address?: {
    street?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
  }
  categorySlug: string
  rating?: number | null
  reviewCount?: number | null
  url?: string
  description?: string
}

/**
 * Build a LocalBusiness JSON-LD schema object.
 * Used on the homepage for rich search results.
 */
export function buildLocalBusinessSchema(input: SchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': getSchemaType(input.categorySlug),
    name: input.businessName,
  }

  if (input.phone) {
    schema.telephone = input.phone
  }

  if (input.url) {
    schema.url = input.url
  }

  if (input.description) {
    schema.description = input.description
  }

  if (input.address?.street || input.address?.city) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(input.address.street && { streetAddress: input.address.street }),
      ...(input.address.city && { addressLocality: input.address.city }),
      ...(input.address.state && { addressRegion: input.address.state }),
      ...(input.address.zip && { postalCode: input.address.zip }),
    }
  }

  if (input.rating && input.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating,
      reviewCount: input.reviewCount,
    }
  }

  return schema
}

interface ServiceSchemaInput {
  serviceName: string
  description: string
  businessName: string
  url?: string
}

/**
 * Build a Service JSON-LD schema for service pages.
 */
export function buildServiceSchema(input: ServiceSchemaInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.serviceName,
    description: input.description,
    provider: {
      '@type': 'LocalBusiness',
      name: input.businessName,
    },
    ...(input.url && { url: input.url }),
  }
}
