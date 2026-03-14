import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { deleteEvent } from '@/lib/services/google-calendar'
import { sendBookingEmail } from '@/lib/services/booking-emails'

/**
 * POST /api/bookings/cancel
 * Cancels a booking by token. Public endpoint — no auth required.
 * Idempotent: if already cancelled, returns the existing record.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { token, reason } = body

  if (!token) {
    return NextResponse.json({ error: 'Missing cancel token' }, { status: 400 })
  }

  const supabase = getAdminClient()

  // Look up booking by cancel token
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('cancel_token', token)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Invalid cancel link' }, { status: 404 })
  }

  // Idempotent: already cancelled
  if (booking.status === 'cancelled') {
    return NextResponse.json(booking)
  }

  // Update booking status
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Delete Google Calendar event
  if (booking.gcal_event_id) {
    try {
      await deleteEvent(booking.user_id, booking.gcal_event_id)
    } catch (err) {
      console.error('[cancel] Failed to delete calendar event:', err)
    }
  }

  // Send cancellation email
  try {
    await sendBookingEmail('cancelled', updated)
  } catch (err) {
    console.error('[cancel] Failed to send email:', err)
  }

  // Notify operator
  await supabase.from('notifications').insert({
    user_id: booking.user_id,
    type: 'booking_cancelled',
    title: `Booking cancelled: ${booking.guest_name}`,
    body: `${booking.guest_name} cancelled their booking on ${new Date(booking.start_time).toLocaleString()}.${reason ? ` Reason: ${reason}` : ''}`,
    data: { booking_id: booking.id },
  })

  // Log activity (do NOT revert business status per spec)
  if (booking.business_id) {
    await supabase.from('activity_log').insert({
      business_id: booking.business_id,
      user_id: booking.user_id,
      event_type: 'booking_cancelled',
      event_data: {
        guest_name: booking.guest_name,
        cancelled_time: booking.start_time,
        reason: reason || null,
      },
    })
  }

  return NextResponse.json(updated)
}
