import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/emails/thread?business_id=X  — all messages for a business
 * GET /api/emails/thread?booking_id=X   — all messages for a booking
 *
 * Returns email_messages ordered by sent_at ASC for thread display.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get('business_id')
  const bookingId = searchParams.get('booking_id')

  if (!businessId && !bookingId) {
    return NextResponse.json(
      { error: 'Provide business_id or booking_id' },
      { status: 400 }
    )
  }

  let query = supabase
    .from('email_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('sent_at', { ascending: true })

  if (businessId) {
    query = query.eq('business_id', businessId)
  }
  if (bookingId) {
    query = query.eq('booking_id', bookingId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
