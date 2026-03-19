/**
 * Zoom API client for Simple Instant Site scheduling.
 *
 * Handles OAuth token management and meeting creation.
 * If Zoom is not connected, the system falls back to phone calls.
 */

import { getAdminClient } from '@/lib/supabase/admin'

const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token'
const ZOOM_API = 'https://api.zoom.us/v2'

export interface ZoomTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  email?: string
}

export interface ZoomMeeting {
  id: number
  join_url: string
  start_url: string
  topic: string
}

function getClientId(): string {
  const id = process.env.ZOOM_CLIENT_ID
  if (!id) throw new Error('ZOOM_CLIENT_ID is not configured')
  return id
}

function getClientSecret(): string {
  const secret = process.env.ZOOM_CLIENT_SECRET
  if (!secret) throw new Error('ZOOM_CLIENT_SECRET is not configured')
  return secret
}

function getRedirectUri(): string {
  const uri = process.env.ZOOM_REDIRECT_URI
  if (!uri) throw new Error('ZOOM_REDIRECT_URI is not configured')
  return uri
}

/**
 * Build the Zoom OAuth consent URL.
 */
export function getZoomAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
  })
  if (state) params.set('state', state)
  return `https://zoom.us/oauth/authorize?${params}`
}

/**
 * Exchange an authorization code for Zoom tokens.
 */
export async function exchangeZoomCode(code: string): Promise<ZoomTokens> {
  const credentials = Buffer.from(`${getClientId()}:${getClientSecret()}`).toString('base64')

  const res = await fetch(ZOOM_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUri(),
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Zoom token exchange failed (${res.status}): ${text}`)
  }

  const data = await res.json()

  // Get user info for email
  const email = await fetchZoomEmail(data.access_token)

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
    email,
  }
}

async function fetchZoomEmail(accessToken: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${ZOOM_API}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return undefined
    const data = await res.json()
    return data.email
  } catch {
    return undefined
  }
}

async function refreshZoomToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_at: number
}> {
  const credentials = Buffer.from(`${getClientId()}:${getClientSecret()}`).toString('base64')

  const res = await fetch(ZOOM_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Zoom token refresh failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  }
}

/**
 * Get a valid Zoom access token for a user, refreshing if needed.
 */
async function getValidZoomToken(userId: string): Promise<string | null> {
  const supabase = getAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('zoom_token')
    .eq('id', userId)
    .single()

  const tokens = user?.zoom_token as ZoomTokens | null
  if (!tokens?.refresh_token) return null

  if (tokens.access_token && tokens.expires_at > Date.now()) {
    return tokens.access_token
  }

  try {
    const refreshed = await refreshZoomToken(tokens.refresh_token)
    const updatedTokens: ZoomTokens = {
      ...tokens,
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: refreshed.expires_at,
    }

    await supabase
      .from('users')
      .update({ zoom_token: updatedTokens })
      .eq('id', userId)

    return refreshed.access_token
  } catch (err) {
    console.error('[zoom] Token refresh failed:', err)
    return null
  }
}

/**
 * Store Zoom tokens for a user.
 */
export async function storeZoomTokens(userId: string, tokens: ZoomTokens): Promise<void> {
  const supabase = getAdminClient()
  await supabase
    .from('users')
    .update({ zoom_token: tokens })
    .eq('id', userId)
}

/**
 * Disconnect Zoom for a user.
 */
export async function disconnectZoom(userId: string): Promise<void> {
  const supabase = getAdminClient()
  await supabase
    .from('users')
    .update({ zoom_token: null })
    .eq('id', userId)
}

/**
 * Check if Zoom is connected for a user.
 */
export async function isZoomConnected(userId: string): Promise<boolean> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('users')
    .select('zoom_token')
    .eq('id', userId)
    .single()
  const tokens = data?.zoom_token as ZoomTokens | null
  return !!tokens?.refresh_token
}

/**
 * Create a Zoom meeting for a booking.
 * Returns null if Zoom is not connected.
 */
export async function createZoomMeeting(
  userId: string,
  options: {
    topic: string
    startTime: Date
    duration: number
    agenda?: string
  }
): Promise<{ join_url: string; meeting_id: string } | null> {
  const accessToken = await getValidZoomToken(userId)
  if (!accessToken) return null

  const res = await fetch(`${ZOOM_API}/users/me/meetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: options.topic,
      type: 2, // scheduled meeting
      start_time: options.startTime.toISOString(),
      duration: options.duration,
      agenda: options.agenda,
      settings: {
        join_before_host: true,
        waiting_room: false,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[zoom] Meeting creation failed (${res.status}): ${text}`)
    return null
  }

  const meeting: ZoomMeeting = await res.json()
  return {
    join_url: meeting.join_url,
    meeting_id: String(meeting.id),
  }
}
