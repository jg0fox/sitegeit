import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch user profile for calendly_link check
  const { data: profile } = await supabase
    .from('users')
    .select('calendly_link')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    instantly: { connected: !!process.env.INSTANTLY_API_KEY },
    google_places: { connected: !!process.env.GOOGLE_PLACES_API_KEY },
    vercel: { connected: !!process.env.VERCEL_TOKEN },
    calendly: {
      connected: !!profile?.calendly_link,
      link: profile?.calendly_link || null,
    },
    stripe: { connected: false, status: 'coming_soon' },
    plausible: { connected: false, status: 'coming_soon' },
  })
}
