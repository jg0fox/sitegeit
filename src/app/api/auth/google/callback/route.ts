import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, storeTokens } from '@/lib/services/google-calendar'

/**
 * GET /api/auth/google/callback
 * Handles the OAuth callback from Google. Exchanges the code for tokens
 * and stores them in the user's profile.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state') // user ID
  const error = request.nextUrl.searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    console.error('[google/callback] OAuth error:', error)
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=google_denied`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=no_code`
    )
  }

  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      `${appUrl}/login?error=unauthorized`
    )
  }

  // Verify state matches current user (prevents CSRF)
  if (state && state !== user.id) {
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=state_mismatch`
    )
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    await storeTokens(user.id, tokens)

    return NextResponse.redirect(
      `${appUrl}/settings/integrations?success=google_connected`
    )
  } catch (err) {
    console.error('[google/callback] Token exchange error:', err)
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=token_exchange_failed`
    )
  }
}
