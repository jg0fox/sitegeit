import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchParamsSchema } from '@/lib/utils/schemas'
import { geocodeRegion, searchAllPages, getPlaceDetails } from '@/lib/services/google-places'
import { detectWebPresence } from '@/lib/services/web-detection'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'
import type { DiscoveryResult, SearchFilters } from '@/lib/utils/types'

// Multi-page fetch + parallel detail lookups can take a while
export const maxDuration = 120

const DETAIL_CONCURRENCY = 5

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

    const { region, category, radius_km, filters } = parsed.data

    // Find the Google Places type for the category
    const categoryConfig = BUSINESS_CATEGORIES.find((c) => c.value === category)
    const placeType = categoryConfig?.type

    // Geocode the region to get lat/lng
    const location = await geocodeRegion(region)

    // Fetch all pages of Google Places results (up to 60)
    const radiusMeters = radius_km * 1000
    const nearbyResults = await searchAllPages(
      location,
      radiusMeters,
      categoryConfig?.label || category,
      placeType
    )

    // Process results in parallel batches (details + web presence)
    const discoveryResults: DiscoveryResult[] = []
    let totalWithActiveSites = 0

    for (let i = 0; i < nearbyResults.length; i += DETAIL_CONCURRENCY) {
      const batch = nearbyResults.slice(i, i + DETAIL_CONCURRENCY)

      const batchResults = await Promise.allSettled(
        batch.map(async (place) => {
          const details = await getPlaceDetails(place.place_id)
          const websiteStatus = await detectWebPresence(details.website)

          // Check if already in the user's pipeline
          const { data: existing } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', user.id)
            .eq('google_place_id', place.place_id)
            .maybeSingle()

          return {
            ...details,
            website_status: websiteStatus,
            already_in_pipeline: !!existing,
          } as DiscoveryResult
        })
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const dr = result.value
          if (dr.website_status === 'active') {
            totalWithActiveSites++
          }
          // Apply user filters (active sites are never filtered here — they show as dimmed in UI)
          if (filters && !passesFilters(dr, filters)) {
            continue
          }
          discoveryResults.push(dr)
        } else {
          console.error('Failed to process place:', result.reason)
        }
      }
    }

    // Sort: non-active sites first, then active sites
    discoveryResults.sort((a, b) => {
      const aActive = a.website_status === 'active' ? 1 : 0
      const bActive = b.website_status === 'active' ? 1 : 0
      return aActive - bActive
    })

    return NextResponse.json({
      results: discoveryResults,
      totalFound: discoveryResults.length,
      totalGoogleResults: nearbyResults.length,
      totalWithActiveSites,
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

  // Website status filters only apply to non-active results.
  // Active-site businesses always pass through (shown dimmed in UI).
  if (
    filters.website_status &&
    filters.website_status.length > 0 &&
    result.website_status !== 'active' &&
    !filters.website_status.includes(result.website_status as 'none' | 'dead' | 'parked' | 'social_only' | 'outdated')
  ) {
    return false
  }

  if (filters.has_phone && !result.formatted_phone_number) {
    return false
  }

  return true
}
