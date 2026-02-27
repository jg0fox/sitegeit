import type { PlaceResult } from '@/lib/utils/types'

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!
const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place'
const GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode'

interface NearbySearchResponse {
  results: GooglePlaceNearby[]
  next_page_token?: string
  status: string
  error_message?: string
}

interface GooglePlaceNearby {
  place_id: string
  name: string
  vicinity: string
  geometry: { location: { lat: number; lng: number } }
  rating?: number
  user_ratings_total?: number
  business_status?: string
  types: string[]
  photos?: { photo_reference: string; width: number; height: number }[]
  opening_hours?: { open_now?: boolean }
}

interface PlaceDetailsResponse {
  result: GooglePlaceDetails
  status: string
  error_message?: string
}

interface GooglePlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  website?: string
  geometry: { location: { lat: number; lng: number } }
  rating?: number
  user_ratings_total?: number
  business_status?: string
  types: string[]
  photos?: { photo_reference: string; width: number; height: number }[]
  opening_hours?: { open_now?: boolean; weekday_text?: string[] }
  url?: string // Google Maps URL
}

interface GeocodeResponse {
  results: { geometry: { location: { lat: number; lng: number } } }[]
  status: string
  error_message?: string
}

export async function geocodeRegion(
  region: string
): Promise<{ lat: number; lng: number }> {
  const url = `${GEOCODE_BASE}/json?address=${encodeURIComponent(region)}&key=${API_KEY}`
  const res = await fetch(url)
  const data: GeocodeResponse = await res.json()

  if (data.status !== 'OK' || data.results.length === 0) {
    throw new Error(
      `Geocoding failed for "${region}": ${data.error_message || data.status}`
    )
  }

  return data.results[0].geometry.location
}

export async function searchNearby(
  location: { lat: number; lng: number },
  radiusMeters: number,
  keyword: string,
  type?: string,
  pageToken?: string
): Promise<{ results: PlaceResult[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    location: `${location.lat},${location.lng}`,
    radius: String(radiusMeters),
    keyword,
    key: API_KEY,
  })

  if (type) params.set('type', type)
  if (pageToken) params.set('pagetoken', pageToken)

  const url = `${PLACES_BASE}/nearbysearch/json?${params}`
  const res = await fetch(url)
  const data: NearbySearchResponse = await res.json()

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(
      `Places search failed: ${data.error_message || data.status}`
    )
  }

  const results: PlaceResult[] = data.results.map((place) => ({
    place_id: place.place_id,
    name: place.name,
    formatted_address: place.vicinity,
    geometry: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
    rating: place.rating,
    user_ratings_total: place.user_ratings_total,
    business_status: place.business_status,
    types: place.types,
    photos: place.photos,
    opening_hours: place.opening_hours,
  }))

  return {
    results,
    nextPageToken: data.next_page_token,
  }
}

export async function getPlaceDetails(
  placeId: string
): Promise<PlaceResult> {
  const fields = [
    'place_id',
    'name',
    'formatted_address',
    'formatted_phone_number',
    'website',
    'geometry',
    'rating',
    'user_ratings_total',
    'business_status',
    'type',
    'photos',
    'opening_hours',
    'url',
  ].join(',')

  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`
  const res = await fetch(url)
  const data: PlaceDetailsResponse = await res.json()

  if (data.status !== 'OK') {
    throw new Error(
      `Place details failed for ${placeId}: ${data.error_message || data.status}`
    )
  }

  const d = data.result
  return {
    place_id: d.place_id,
    name: d.name,
    formatted_address: d.formatted_address,
    geometry: { lat: d.geometry.location.lat, lng: d.geometry.location.lng },
    rating: d.rating,
    user_ratings_total: d.user_ratings_total,
    business_status: d.business_status,
    types: d.types,
    formatted_phone_number: d.formatted_phone_number,
    website: d.website,
    photos: d.photos,
    opening_hours: d.opening_hours,
  }
}

export async function batchGetDetails(
  placeIds: string[]
): Promise<PlaceResult[]> {
  const results: PlaceResult[] = []
  for (const id of placeIds) {
    try {
      const detail = await getPlaceDetails(id)
      results.push(detail)
    } catch (err) {
      console.error(`Failed to fetch details for ${id}:`, err)
    }
  }
  return results
}

export function getPhotoUrl(
  photoReference: string,
  maxWidth = 400
): string {
  return `${PLACES_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`
}
