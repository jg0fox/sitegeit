import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getZoomAuthUrl } from '@/lib/services/zoom'

/**
 * GET /api/auth/zoom
 * Initiates Zoom OAuth flow.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authUrl = getZoomAuthUrl(user.id)
  return NextResponse.redirect(authUrl)
}
