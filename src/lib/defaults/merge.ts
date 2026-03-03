import type { DataConfidence } from '@/lib/ai/prompts/enrichment'
import type { CategoryDefaults } from './category-defaults'

export interface MergedProfile {
  // Core business data (always from DB)
  name: string
  category: string
  address: { street: string; city: string; state: string; zip: string }
  phone: string | null
  email: string | null
  google_rating: number | null
  google_review_count: number | null

  // Enrichment fields (with defaults backfill)
  hours: Record<string, string> | null
  brand_voice: string | null
  brand_colors: { primary: string | null; secondary: string | null; source: string } | null
  value_proposition: string | null
  services: string[]
  service_area: string | null
  target_audience: string | null
  review_sentiment: string | null
  top_review_excerpts: string[]
  owner_name: string | null

  // From category defaults (always present after merge)
  service_details: { name: string; description: string; icon: string }[] | null
  trust_signals: string[]
  faq_templates: { question: string; answer_template: string }[]
  hero_options: { headline_template: string; subheadline_template: string }[]
  cta_language: { primary: string; secondary: string }

  // Image availability (resolved by generate-site.ts, passed to prompt for context)
  _has_hero_image: boolean
  _has_about_image: boolean

  // Confidence metadata (passes through to generation prompt)
  _confidence: DataConfidence
  _source: Record<string, string>
}

const DEFAULT_CONFIDENCE: DataConfidence = {
  overall: 'low',
  fields: {
    brand_voice: 'default',
    services: 'default',
    value_proposition: 'default',
    testimonials: 'unavailable',
    owner_name: 'unavailable',
    hours: 'unavailable',
    certifications: 'unavailable',
  },
}

const FALLBACK_DEFAULTS: Pick<CategoryDefaults, 'trust_signals' | 'cta_language' | 'faq_templates' | 'hero_templates'> = {
  trust_signals: ['Locally Owned', 'Serving the Community'],
  cta_language: { primary: 'Get in Touch', secondary: 'Learn More' },
  faq_templates: [],
  hero_templates: [
    { headline_template: 'Trusted Local Service in {city}', subheadline_template: '{business_name} is here to help.' },
  ],
}

/**
 * Interpolate template placeholders with actual business data.
 */
function interpolate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value)
  }
  return result
}

/**
 * Merge enrichment output with category defaults, using confidence scores
 * to decide which fields come from enrichment vs. defaults.
 */
export function mergeEnrichmentWithDefaults(
  business: Record<string, unknown>,
  enrichmentConfidence: DataConfidence | null,
  defaults: CategoryDefaults | null,
  imageAvailability?: { hero: boolean; about: boolean },
): MergedProfile {
  const confidence = enrichmentConfidence ?? DEFAULT_CONFIDENCE

  const city = (business.address_city as string) || ''
  const state = (business.address_state as string) || ''
  const businessName = (business.name as string) || ''
  const phone = (business.phone as string) || null

  const templateVars: Record<string, string> = {
    city,
    state,
    business_name: businessName,
    service: (business.category as string) || 'service',
  }

  // Determine services source
  const enrichmentServices = business.services as string[] | null
  const hasEnrichmentServices = enrichmentServices && enrichmentServices.length > 0 &&
    confidence.fields.services !== 'default'

  const services = hasEnrichmentServices
    ? enrichmentServices
    : defaults?.typical_services.map(s => s.name) ?? []

  const serviceDetails = hasEnrichmentServices
    ? null // generation prompt will create descriptions from enrichment
    : defaults?.typical_services ?? null

  // Determine hours source
  const hours = confidence.fields.hours === 'verified'
    ? (business.hours as Record<string, string> | null)
    : defaults?.typical_hours ?? null

  // Determine brand_voice source
  const brandVoice = confidence.fields.brand_voice !== 'default'
    ? (business.brand_voice as string | null)
    : defaults
      ? `${defaults.voice_archetype}. ${defaults.voice_characteristics.join('. ')}.`
      : null

  // Determine value_proposition source
  const valueProp = confidence.fields.value_proposition !== 'default'
    ? (business.value_proposition as string | null)
    : null

  // Interpolate FAQ templates
  const faqTemplates = (defaults?.faq_templates ?? FALLBACK_DEFAULTS.faq_templates).map(t => ({
    question: interpolate(t.question, templateVars),
    answer_template: interpolate(t.answer_template, templateVars),
  }))

  // Interpolate hero templates
  const heroOptions = (defaults?.hero_templates ?? FALLBACK_DEFAULTS.hero_templates).map(t => ({
    headline_template: interpolate(t.headline_template, templateVars),
    subheadline_template: interpolate(t.subheadline_template, templateVars),
  }))

  return {
    name: businessName,
    category: (business.category as string) || '',
    address: {
      street: (business.address_street as string) || '',
      city,
      state,
      zip: (business.address_zip as string) || '',
    },
    phone,
    email: (business.email as string) || null,
    google_rating: (business.google_rating as number) ?? null,
    google_review_count: (business.google_review_count as number) ?? null,
    hours,
    brand_voice: brandVoice,
    brand_colors: (business.brand_colors as { primary: string | null; secondary: string | null; source: string }) || null,
    value_proposition: valueProp,
    services,
    service_area: (business.service_area as string) || null,
    target_audience: (business.target_audience as string) || null,
    review_sentiment: (business.review_sentiment as string) || null,
    top_review_excerpts: (business.top_review_excerpts as string[]) ?? [],
    owner_name: (business.owner_name as string) || null,
    service_details: serviceDetails,
    trust_signals: defaults?.trust_signals ?? FALLBACK_DEFAULTS.trust_signals,
    faq_templates: faqTemplates,
    hero_options: heroOptions,
    cta_language: defaults?.cta_language ?? FALLBACK_DEFAULTS.cta_language,
    _has_hero_image: imageAvailability?.hero ?? false,
    _has_about_image: imageAvailability?.about ?? false,
    _confidence: confidence,
    _source: {
      services: confidence.fields.services,
      voice: confidence.fields.brand_voice,
      testimonials: confidence.fields.testimonials,
      hours: confidence.fields.hours,
      value_proposition: confidence.fields.value_proposition,
    },
  }
}
