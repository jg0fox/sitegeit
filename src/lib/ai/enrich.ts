import { getAdminClient } from '@/lib/supabase/admin'
import { generateJSON } from './client'
import {
  ENRICHMENT_SYSTEM_PROMPT,
  buildEnrichmentPrompt,
  type EnrichmentInput,
  type EnrichmentOutput,
  type DataConfidence,
} from './prompts/enrichment'

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
    review_excerpts: '', // TODO: fetch from Google Places reviews API if available
    facebook_url: business.facebook_url,
    instagram_url: business.instagram_url,
    yelp_url: business.yelp_url,
    yelp_rating: business.yelp_rating,
    yelp_review_count: business.yelp_review_count,
  }

  const userPrompt = buildEnrichmentPrompt(input)
  const result = await generateJSON<EnrichmentOutput>(ENRICHMENT_SYSTEM_PROMPT, userPrompt)

  // Update business with enrichment data
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
