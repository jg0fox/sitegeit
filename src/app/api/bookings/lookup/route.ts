import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/bookings/lookup?reschedule_token=xxx
 * GET /api/bookings/lookup?cancel_token=xxx
 *
 * Public endpoint — looks up a booking by token.
 * Returns limited info (no tokens exposed back).
 */
export async function GET(request: NextRequest) {
  const rescheduleToken = request.nextUrl.searchParams.get('reschedule_token')
  const cancelToken = request.nextUrl.searchParams.get('cancel_token')

  if (!rescheduleToken && !cancelToken) {
    return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 })
  }

  const supabase = getAdminClient()

  let query = supabase
    .from('bookings')
    .select('id, start_time, end_time, guest_name, guest_email, meeting_type, status, zoom_join_url')

  if (rescheduleToken) {
    query = query.eq('reschedule_token', rescheduleToken)
  } else if (cancelToken) {
    query = query.eq('cancel_token', cancelToken)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
