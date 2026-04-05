export const ENRICHMENT_SYSTEM_PROMPT = `You are a business analyst specializing in local business profiling for website creation. Given raw data about a business (Google Places data, review excerpts, social media presence), you produce a structured business profile that will be used to generate a conversion-optimized website.

Rules:
- Only include information that is supported by the provided data
- Never fabricate services, credentials, reviews, or statistics
- When data is insufficient for a field, set its value to null. Do not write explanatory or apologetic text in content fields (e.g., "Due to insufficient data...", "Cannot be determined from available information"). The confidence scoring system handles uncertainty. Content fields must contain either usable content or null, never hedging language.
- Extract voice and tone from actual review language and social media posts
- Be specific about location (neighborhood names, landmarks) when the data supports it
- Score data confidence honestly: "verified" means directly confirmed by data, "inferred" means reasonably derived from limited signals, "default" means no business-specific signal exists`

export interface EnrichmentInput {
  business_name: string
  category: string
  full_address: string
  phone: string | null
  rating: number | null
  review_count: number | null
  hours_json: string | null
  photo_count: number
  review_excerpts: string
  facebook_url: string | null
  instagram_url: string | null
  yelp_url: string | null
  yelp_rating: number | null
  yelp_review_count: number | null
}

export interface DataConfidence {
  overall: 'high' | 'medium' | 'low'
  fields: {
    brand_voice: 'verified' | 'inferred' | 'default'
    services: 'verified' | 'inferred' | 'default'
    value_proposition: 'verified' | 'inferred' | 'default'
    testimonials: 'verified' | 'unavailable'
    owner_name: 'verified' | 'unavailable'
    hours: 'verified' | 'unavailable'
    certifications: 'verified' | 'unavailable'
  }
}

export interface EnrichmentOutput {
  brand_voice: string
  voice_archetype: string
  voice_characteristics: string[]
  value_proposition: string
  services: string[]
  service_area: string
  target_audience: string
  review_sentiment_summary: string
  top_review_excerpts: string[]
  brand_colors: {
    primary: string | null
    secondary: string | null
    source: string
  }
  unique_selling_points: string[]
  owner_name: string | null
  years_in_business: number | null
  certifications_licenses: string[]
  pricing_signals: string | null
  data_confidence: DataConfidence
}

export function buildEnrichmentPrompt(input: EnrichmentInput): string {
  return `Analyze this business and produce a structured profile.

## Raw Business Data
- Name: ${input.business_name}
- Category: ${input.category}
- Address: ${input.full_address}
- Phone: ${input.phone || 'Not available'}
- Google Rating: ${input.rating ?? 'N/A'} (${input.review_count ?? 0} reviews)
- Hours: ${input.hours_json || 'Not available'}
- Google Photos: ${input.photo_count} photos available

## Review Excerpts (most recent 15)
${input.review_excerpts || 'No reviews available'}

## Social Media Presence
- Facebook: ${input.facebook_url || 'None'}
- Instagram: ${input.instagram_url || 'None'}
- Yelp: ${input.yelp_url || 'None'}${input.yelp_rating ? ` (Rating: ${input.yelp_rating}, ${input.yelp_review_count} reviews)` : ''}

## Respond with this exact JSON structure:
{
  "brand_voice": "2-3 sentence description of the business's communication personality, derived from reviews and social presence",
  "voice_archetype": "one of: Trustworthy Expert | Warm Neighbor | Bold Professional | Friendly Guide | Calm Authority | Energetic Enthusiast",
  "voice_characteristics": ["3-5 specific traits, e.g. 'Direct and practical', 'Uses trade terminology comfortably'"],
  "value_proposition": "1 sentence capturing what makes this business valuable to customers, based on review themes",
  "services": ["list of services confirmed by reviews or profile data"],
  "service_area": "geographic area served, derived from review mentions and address",
  "target_audience": "1-2 sentences describing typical customers based on review demographics and service type",
  "review_sentiment_summary": "2-3 sentences summarizing the main themes from reviews (what customers praise, any concerns)",
  "top_review_excerpts": ["3-5 most compelling review quotes that could be used on the website"],
  "brand_colors": {
    "primary": "hex color derived from photos/logo or null",
    "secondary": "hex color or null",
    "source": "derived from photos | category default | unable to determine"
  },
  "unique_selling_points": ["3-5 specific differentiators extracted from reviews"],
  "owner_name": "owner's first name if mentioned in reviews or profile, else null",
  "years_in_business": "number or null if not determinable",
  "certifications_licenses": ["any mentioned in reviews or profile, else empty array"],
  "pricing_signals": "any pricing information from reviews (e.g., 'affordable', 'premium', specific prices mentioned) or null",
  "data_confidence": {
    "overall": "high | medium | low (high: 20+ reviews AND social presence; medium: 5-19 reviews OR social presence; low: <5 reviews AND no social presence)",
    "fields": {
      "brand_voice": "verified (directly derived from reviews/social) | inferred (reasonably derived from category + limited signals) | default (no business-specific signal)",
      "services": "verified (confirmed by reviews or profile) | inferred (derived from category + limited signals) | default (no specific services found)",
      "value_proposition": "verified | inferred | default",
      "testimonials": "verified (real review excerpts available) | unavailable (no usable review text)",
      "owner_name": "verified (mentioned in reviews or profile) | unavailable",
      "hours": "verified (from Google profile) | unavailable",
      "certifications": "verified (mentioned in reviews or profile) | unavailable"
    }
  }
}`
}
