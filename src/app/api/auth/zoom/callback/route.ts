import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeZoomCode, storeZoomTokens } from '@/lib/services/zoom'

/**
 * GET /api/auth/zoom/callback
 * Handles the OAuth callback from Zoom.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=zoom_denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=no_code`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login?error=unauthorized`)
  }

  try {
    const tokens = await exchangeZoomCode(code)
    await storeZoomTokens(user.id, tokens)
    return NextResponse.redirect(`${appUrl}/settings/integrations?success=zoom_connected`)
  } catch (err) {
    console.error('[zoom/callback] Token exchange error:', err)
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=zoom_exchange_failed`)
  }
}
