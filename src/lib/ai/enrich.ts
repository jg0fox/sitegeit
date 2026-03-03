import { getAdminClient } from '@/lib/supabase/admin'
import { generateJSON } from './client'
import { getPlaceDetails } from '@/lib/services/google-places'
import {
  ENRICHMENT_SYSTEM_PROMPT,
  buildEnrichmentPrompt,
  type EnrichmentInput,
  type EnrichmentOutput,
  type DataConfidence,
} from './prompts/enrichment'

/**
 * Fetch reviews from Google Places API and format them as text for the enrichment prompt.
 * Returns both the formatted string and the raw review data for storage.
 */
async function fetchReviewExcerpts(
  googlePlaceId: string | null
): Promise<{ formatted: string; raw: { author_name: string; rating: number; text: string; time: number }[] }> {
  if (!googlePlaceId) return { formatted: '', raw: [] }

  try {
    const details = await getPlaceDetails(googlePlaceId)
    const reviews = details.reviews ?? []
    if (reviews.length === 0) return { formatted: '', raw: [] }

    const formatted = reviews
      .filter(r => r.text && r.text.length > 10)
      .map(r => `[${r.rating}★] "${r.text}" — ${r.author_name}`)
      .join('\n\n')

    return { formatted, raw: reviews }
  } catch (err) {
    console.error(`Failed to fetch reviews for ${googlePlaceId}:`, err)
    return { formatted: '', raw: [] }
  }
}

export async function enrichBusiness(businessId: string): Promise<EnrichmentOutput> {
  const supabase = getAdminClient()

  // Fetch business data
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (fetchError || !business) {
    throw new Error(`Failed to fetch business ${businessId}: ${fetchError?.message}`)
  }

  // Update status to enriching
  await supabase
    .from('businesses')
    .update({ status: 'enriching' })
    .eq('id', businessId)

  // Fetch reviews from Google Places API
  const reviewData = await fetchReviewExcerpts(business.google_place_id)

  // Build the enrichment input from business data
  const input: EnrichmentInput = {
    business_name: business.name,
    category: business.category,
    full_address: [business.address_street, business.address_city, business.address_state, business.address_zip]
      .filter(Boolean)
      .join(', '),
    phone: business.phone,
    rating: business.google_rating,
    review_count: business.google_review_count,
    hours_json: business.hours ? JSON.stringify(business.hours) : null,
    photo_count: business.photos ? (business.photos as string[]).length : 0,
    review_excerpts: reviewData.formatted,
    facebook_url: business.facebook_url,
    instagram_url: business.instagram_url,
    yelp_url: business.yelp_url,
    yelp_rating: business.yelp_rating,
    yelp_review_count: business.yelp_review_count,
  }

  const userPrompt = buildEnrichmentPrompt(input)
  const result = await generateJSON<EnrichmentOutput>(ENRICHMENT_SYSTEM_PROMPT, userPrompt)

  // Update business with enrichment data + raw reviews + extracted excerpts
  const { error: updateError } = await supabase
    .from('businesses')
    .update({
      brand_voice: result.brand_voice,
      brand_colors: result.brand_colors,
      value_proposition: result.value_proposition,
      services: result.services,
      service_area: result.service_area,
      target_audience: result.target_audience,
      review_sentiment: result.review_sentiment_summary,
      owner_name: result.owner_name ?? business.owner_name,
      enrichment_confidence: result.data_confidence,
      google_reviews: reviewData.raw.length > 0 ? reviewData.raw : null,
      top_review_excerpts: result.top_review_excerpts.length > 0 ? result.top_review_excerpts : null,
      status: 'enriched',
      enriched_at: new Date().toISOString(),
    })
    .eq('id', businessId)

  if (updateError) {
    throw new Error(`Failed to update business ${businessId}: ${updateError.message}`)
  }

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: businessId,
    event_type: 'enrichment_complete',
    event_data: {
      voice_archetype: result.voice_archetype,
      services_count: result.services.length,
      usps_count: result.unique_selling_points.length,
      data_confidence: result.data_confidence,
    },
  })

  return result
}
