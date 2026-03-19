/**
 * Google Calendar API client for Simple Instant Site scheduling.
 *
 * Handles OAuth token management, free/busy queries,
 * and calendar event CRUD. Tokens are stored as jsonb
 * in the users table and refreshed automatically.
 */

import { getAdminClient } from '@/lib/supabase/admin'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

// ── Types ──────────────────────────────────────────────

export interface GoogleTokens {
  access_token: string
  refresh_token: string
  expires_at: number // unix timestamp in ms
  email?: string
}

export interface BusySlot {
  start: string // ISO string
  end: string   // ISO string
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime: string; timeZone?: string }
  end: { dateTime: string; timeZone?: string }
  attendees?: { email: string; displayName?: string }[]
  hangoutLink?: string
  htmlLink?: string
}

export interface CreateEventParams {
  summary: string
  description?: string
  start: Date
  end: Date
  timeZone: string
  attendees?: { email: string; displayName?: string }[]
  location?: string
  conferenceUrl?: string
}

// ── OAuth Helpers ──────────────────────────────────────

function getClientId(): string {
  const id = process.env.GOOGLE_OAUTH_CLIENT_ID
  if (!id) throw new Error('GOOGLE_OAUTH_CLIENT_ID is not configured')
  return id
}

function getClientSecret(): string {
  const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!secret) throw new Error('GOOGLE_OAUTH_CLIENT_SECRET is not configured')
  return secret
}

function getRedirectUri(): string {
  const uri = process.env.GOOGLE_OAUTH_REDIRECT_URI
  if (!uri) throw new Error('GOOGLE_OAUTH_REDIRECT_URI is not configured')
  return uri
}

/**
 * Build the Google OAuth consent URL.
 */
export function getGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/calendar.freebusy',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })
  if (state) params.set('state', state)
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google token exchange failed (${res.status}): ${text}`)
  }

  const data = await res.json()

  // Fetch the user's email
  const email = await fetchGoogleEmail(data.access_token)

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000, // subtract 60s buffer
    email,
  }
}

/**
 * Fetch the Google user's email from the access token.
 */
async function fetchGoogleEmail(accessToken: string): Promise<string | undefined> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return undefined
    const data = await res.json()
    return data.email
  } catch {
    return undefined
  }
}

/**
 * Refresh an expired access token using the refresh token.
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  expires_at: number
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google token refresh failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  }
}

// ── Token Management ───────────────────────────────────

/**
 * Get a valid access token for a user, refreshing if needed.
 * Updates the stored token in the database if refreshed.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const supabase = getAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('google_calendar_token')
    .eq('id', userId)
    .single()

  const tokens = user?.google_calendar_token as GoogleTokens | null
  if (!tokens?.refresh_token) {
    throw new Error('Google Calendar is not connected. Please connect it in Settings.')
  }

  // Check if token is still valid (with 60s buffer already built in)
  if (tokens.access_token && tokens.expires_at > Date.now()) {
    return tokens.access_token
  }

  // Refresh the token
  const refreshed = await refreshAccessToken(tokens.refresh_token)
  const updatedTokens: GoogleTokens = {
    ...tokens,
    access_token: refreshed.access_token,
    expires_at: refreshed.expires_at,
  }

  await supabase
    .from('users')
    .update({ google_calendar_token: updatedTokens })
    .eq('id', userId)

  return refreshed.access_token
}

/**
 * Store Google Calendar tokens for a user.
 */
export async function storeTokens(userId: string, tokens: GoogleTokens): Promise<void> {
  const supabase = getAdminClient()
  await supabase
    .from('users')
    .update({ google_calendar_token: tokens })
    .eq('id', userId)
}

/**
 * Disconnect Google Calendar for a user.
 */
export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  const supabase = getAdminClient()
  await supabase
    .from('users')
    .update({ google_calendar_token: null })
    .eq('id', userId)
}

// ── Calendar API Methods ───────────────────────────────

/**
 * Make an authenticated request to the Google Calendar API.
 */
async function calendarFetch<T>(
  userId: string,
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const accessToken = await getValidAccessToken(userId)
  const { method = 'GET', body } = options

  const res = await fetch(`${GOOGLE_CALENDAR_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google Calendar API ${method} ${path} failed (${res.status}): ${text}`)
  }

  // DELETE returns no content
  if (res.status === 204 || method === 'DELETE') {
    return {} as T
  }

  return res.json() as Promise<T>
}

/**
 * Get free/busy information for the user's primary calendar.
 */
export async function getFreeBusy(
  userId: string,
  timeMin: Date,
  timeMax: Date
): Promise<BusySlot[]> {
  const result = await calendarFetch<{
    calendars: Record<string, { busy: BusySlot[] }>
  }>(userId, '/freeBusy', {
    method: 'POST',
    body: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: 'primary' }],
    },
  })

  return result.calendars?.primary?.busy ?? []
}

/**
 * Create a calendar event on the user's primary calendar.
 */
export async function createEvent(
  userId: string,
  params: CreateEventParams
): Promise<CalendarEvent> {
  const event: Record<string, unknown> = {
    summary: params.summary,
    description: params.description,
    start: { dateTime: params.start.toISOString(), timeZone: params.timeZone },
    end: { dateTime: params.end.toISOString(), timeZone: params.timeZone },
    attendees: params.attendees,
  }

  if (params.location) {
    event.location = params.location
  }

  // Add conference URL to description if provided (Zoom link)
  if (params.conferenceUrl && params.description) {
    event.description = `${params.description}\n\nJoin via Zoom: ${params.conferenceUrl}`
    event.location = params.conferenceUrl
  }

  return calendarFetch<CalendarEvent>(
    userId,
    '/calendars/primary/events?sendUpdates=all',
    { method: 'POST', body: event }
  )
}

/**
 * Update an existing calendar event.
 */
export async function updateEvent(
  userId: string,
  eventId: string,
  updates: Partial<CreateEventParams>
): Promise<CalendarEvent> {
  const patch: Record<string, unknown> = {}

  if (updates.summary) patch.summary = updates.summary
  if (updates.description) patch.description = updates.description
  if (updates.start) {
    patch.start = { dateTime: updates.start.toISOString(), timeZone: updates.timeZone }
  }
  if (updates.end) {
    patch.end = { dateTime: updates.end.toISOString(), timeZone: updates.timeZone }
  }
  if (updates.attendees) patch.attendees = updates.attendees
  if (updates.location) patch.location = updates.location

  return calendarFetch<CalendarEvent>(
    userId,
    `/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    { method: 'PATCH', body: patch }
  )
}

/**
 * Delete a calendar event.
 */
export async function deleteEvent(
  userId: string,
  eventId: string
): Promise<void> {
  await calendarFetch<void>(
    userId,
    `/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    { method: 'DELETE' }
  )
}
