import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchParamsSchema } from '@/lib/utils/schemas'
import { geocodeRegion, searchNearby, getPlaceDetails } from '@/lib/services/google-places'
import { detectWebPresence } from '@/lib/services/web-detection'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'
import type { DiscoveryResult, SearchFilters } from '@/lib/utils/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = searchParamsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { region, category, radius_km, filters, pageToken } = parsed.data

    // Find the Google Places type for the category
    const categoryConfig = BUSINESS_CATEGORIES.find((c) => c.value === category)
    const placeType = categoryConfig?.type

    // Geocode the region to get lat/lng
    const location = await geocodeRegion(region)

    // Search Google Places
    const radiusMeters = radius_km * 1000
    const { results: nearbyResults, nextPageToken } = await searchNearby(
      location,
      radiusMeters,
      categoryConfig?.label || category,
      placeType,
      pageToken
    )

    // Get details and detect web presence for each result
    const discoveryResults: DiscoveryResult[] = []

    for (const place of nearbyResults) {
      try {
        // Get full details (phone, website, hours)
        const details = await getPlaceDetails(place.place_id)

        // Detect web presence
        const websiteStatus = await detectWebPresence(details.website)

        // Skip active websites — they don't need our services
        if (websiteStatus === 'active') {
          continue
        }

        // Check if already in the user's pipeline
        const { data: existing } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .eq('google_place_id', place.place_id)
          .maybeSingle()

        const result: DiscoveryResult = {
          ...details,
          website_status: websiteStatus,
          already_in_pipeline: !!existing,
        }

        // Apply client-side filters
        if (filters && !passesFilters(result, filters)) {
          continue
        }

        discoveryResults.push(result)
      } catch (err) {
        console.error(`Failed to process place ${place.place_id}:`, err)
      }
    }

    return NextResponse.json({
      results: discoveryResults,
      nextPageToken,
      totalFound: discoveryResults.length,
    })
  } catch (err) {
    console.error('Discovery search error:', err)
    const message = err instanceof Error ? err.message : 'Search failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function passesFilters(
  result: DiscoveryResult,
  filters: SearchFilters
): boolean {
  if (
    filters.min_rating !== undefined &&
    (result.rating === undefined || result.rating < filters.min_rating)
  ) {
    return false
  }

  if (
    filters.min_reviews !== undefined &&
    (result.user_ratings_total === undefined ||
      result.user_ratings_total < filters.min_reviews)
  ) {
    return false
  }

  if (
    filters.website_status &&
    filters.website_status.length > 0 &&
    !filters.website_status.includes(result.website_status as 'none' | 'dead' | 'parked' | 'social_only' | 'outdated')
  ) {
    return false
  }

  if (filters.has_phone && !result.formatted_phone_number) {
    return false
  }

  return true
}
