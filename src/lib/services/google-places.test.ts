import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodeRegion, searchNearby, getPlaceDetails, getPhotoUrl } from './google-places'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('geocodeRegion', () => {
  it('returns lat/lng for a valid region', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [{ geometry: { location: { lat: 30.2672, lng: -97.7431 } } }],
          status: 'OK',
        })
      )
    )
    const result = await geocodeRegion('Austin, TX')
    expect(result).toEqual({ lat: 30.2672, lng: -97.7431 })
  })

  it('throws for invalid region', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ results: [], status: 'ZERO_RESULTS' })
      )
    )
    await expect(geocodeRegion('xyznonexistent')).rejects.toThrow(
      /Geocoding failed/
    )
  })
})

describe('searchNearby', () => {
  it('returns mapped results', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              place_id: 'ChIJ123',
              name: "Joe's Plumbing",
              vicinity: '123 Main St, Austin',
              geometry: { location: { lat: 30.27, lng: -97.74 } },
              rating: 4.5,
              user_ratings_total: 127,
              types: ['plumber', 'point_of_interest'],
            },
          ],
          next_page_token: 'token123',
          status: 'OK',
        })
      )
    )

    const { results, nextPageToken } = await searchNearby(
      { lat: 30.27, lng: -97.74 },
      10000,
      'plumber'
    )

    expect(results).toHaveLength(1)
    expect(results[0].place_id).toBe('ChIJ123')
    expect(results[0].name).toBe("Joe's Plumbing")
    expect(results[0].rating).toBe(4.5)
    expect(nextPageToken).toBe('token123')
  })

  it('handles ZERO_RESULTS', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ results: [], status: 'ZERO_RESULTS' })
      )
    )

    const { results } = await searchNearby(
      { lat: 0, lng: 0 },
      10000,
      'plumber'
    )
    expect(results).toHaveLength(0)
  })

  it('throws on API error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [],
          status: 'REQUEST_DENIED',
          error_message: 'API key invalid',
        })
      )
    )

    await expect(
      searchNearby({ lat: 0, lng: 0 }, 10000, 'plumber')
    ).rejects.toThrow(/Places search failed/)
  })
})

describe('getPlaceDetails', () => {
  it('returns full place details', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          result: {
            place_id: 'ChIJ123',
            name: "Joe's Plumbing",
            formatted_address: '123 Main St, Austin, TX 78701',
            formatted_phone_number: '(512) 555-0123',
            website: 'https://joesplumbing.com',
            geometry: { location: { lat: 30.27, lng: -97.74 } },
            rating: 4.5,
            user_ratings_total: 127,
            types: ['plumber'],
            opening_hours: {
              open_now: true,
              weekday_text: ['Monday: 8:00 AM – 5:00 PM'],
            },
          },
          status: 'OK',
        })
      )
    )

    const result = await getPlaceDetails('ChIJ123')
    expect(result.place_id).toBe('ChIJ123')
    expect(result.formatted_phone_number).toBe('(512) 555-0123')
    expect(result.website).toBe('https://joesplumbing.com')
    expect(result.opening_hours?.weekday_text).toHaveLength(1)
  })
})

describe('getPhotoUrl', () => {
  it('constructs correct URL', () => {
    const url = getPhotoUrl('photo_ref_123', 800)
    expect(url).toContain('photo_ref_123')
    expect(url).toContain('maxwidth=800')
  })
})
