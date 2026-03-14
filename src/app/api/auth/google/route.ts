import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAuthUrl } from '@/lib/services/google-calendar'

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow for Calendar access.
 * Redirects to Google's consent screen.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authUrl = getGoogleAuthUrl(user.id)
  return NextResponse.redirect(authUrl)
}
