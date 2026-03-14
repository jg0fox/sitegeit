import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { disconnectZoom } from '@/lib/services/zoom'

/**
 * POST /api/auth/zoom/disconnect
 * Disconnects Zoom for the current user.
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await disconnectZoom(user.id)
  return NextResponse.json({ success: true })
}
