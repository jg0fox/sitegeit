import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { GoogleTokens } from '@/lib/services/google-calendar'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch user profile for calendly_link and OAuth tokens
  const { data: profile } = await supabase
    .from('users')
    .select('calendly_link, google_calendar_token, zoom_token')
    .eq('id', user.id)
    .single()

  const gcalToken = profile?.google_calendar_token as GoogleTokens | null
  const zoomToken = profile?.zoom_token as { email?: string } | null

  return NextResponse.json({
    instantly: { connected: !!process.env.INSTANTLY_API_KEY },
    google_places: { connected: !!process.env.GOOGLE_PLACES_API_KEY },
    vercel: { connected: !!process.env.VERCEL_TOKEN },
    google_calendar: {
      connected: !!gcalToken?.refresh_token,
      email: gcalToken?.email || null,
      configured: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
    },
    zoom: {
      connected: !!zoomToken,
      email: zoomToken?.email || null,
      configured: !!process.env.ZOOM_CLIENT_ID,
    },
    calendly: {
      connected: !!profile?.calendly_link,
      link: profile?.calendly_link || null,
    },
    stripe: { connected: false, status: 'coming_soon' },
    plausible: { connected: false, status: 'coming_soon' },
  })
}
