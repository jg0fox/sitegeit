import { describe, it, expect } from 'vitest'
import { ENRICHMENT_SYSTEM_PROMPT, buildEnrichmentPrompt, type EnrichmentInput } from './enrichment'

describe('enrichment prompts', () => {
  const sampleInput: EnrichmentInput = {
    business_name: "Joe's Plumbing",
    category: 'Plumber',
    full_address: '123 Main St, Austin, TX 78701',
    phone: '(512) 555-0123',
    rating: 4.8,
    review_count: 247,
    hours_json: '{"monday": "8:00 AM - 5:00 PM"}',
    photo_count: 12,
    review_excerpts: "Great service! Joe came out same day and fixed our leak.",
    facebook_url: 'https://facebook.com/joesplumbing',
    instagram_url: null,
    yelp_url: 'https://yelp.com/biz/joes-plumbing',
    yelp_rating: 4.5,
    yelp_review_count: 89,
  }

  it('system prompt mentions business profiling', () => {
    expect(ENRICHMENT_SYSTEM_PROMPT).toContain('business analyst')
    expect(ENRICHMENT_SYSTEM_PROMPT).toContain('Never fabricate')
  })

  it('builds prompt with all business fields', () => {
    const prompt = buildEnrichmentPrompt(sampleInput)

    expect(prompt).toContain("Joe's Plumbing")
    expect(prompt).toContain('Plumber')
    expect(prompt).toContain('123 Main St, Austin, TX 78701')
    expect(prompt).toContain('(512) 555-0123')
    expect(prompt).toContain('4.8')
    expect(prompt).toContain('247')
    expect(prompt).toContain('12 photos')
    expect(prompt).toContain('facebook.com/joesplumbing')
    expect(prompt).toContain('yelp.com/biz/joes-plumbing')
    expect(prompt).toContain('4.5')
  })

  it('handles missing optional fields gracefully', () => {
    const minInput: EnrichmentInput = {
      business_name: 'Test Biz',
      category: 'Other',
      full_address: '456 Oak Ave',
      phone: null,
      rating: null,
      review_count: null,
      hours_json: null,
      photo_count: 0,
      review_excerpts: '',
      facebook_url: null,
      instagram_url: null,
      yelp_url: null,
      yelp_rating: null,
      yelp_review_count: null,
    }

    const prompt = buildEnrichmentPrompt(minInput)

    expect(prompt).toContain('Test Biz')
    expect(prompt).toContain('Not available')
    expect(prompt).toContain('N/A')
    expect(prompt).toContain('0 photos')
    expect(prompt).toContain('None')
  })

  it('includes JSON structure in prompt', () => {
    const prompt = buildEnrichmentPrompt(sampleInput)
    expect(prompt).toContain('brand_voice')
    expect(prompt).toContain('voice_archetype')
    expect(prompt).toContain('services')
    expect(prompt).toContain('unique_selling_points')
  })
})
