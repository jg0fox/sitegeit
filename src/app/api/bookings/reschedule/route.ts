import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getSchedulingConfig } from '@/lib/services/scheduling'
import { updateEvent } from '@/lib/services/google-calendar'
import { sendBookingEmail } from '@/lib/services/booking-emails'

/**
 * POST /api/bookings/reschedule
 * Reschedules a booking by token. Public endpoint — no auth required.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { token, start_time, end_time } = body

  if (!token || !start_time || !end_time) {
    return NextResponse.json(
      { error: 'Missing required fields: token, start_time, end_time' },
      { status: 400 }
    )
  }

  const supabase = getAdminClient()

  // Look up booking by reschedule token
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('reschedule_token', token)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Invalid reschedule link' }, { status: 404 })
  }

  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'This booking has been cancelled' }, { status: 400 })
  }

  const originalTime = booking.start_time

  // Update booking
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({
      start_time,
      end_time,
      rescheduled_from: originalTime,
      status: 'rescheduled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update Google Calendar event
  if (booking.gcal_event_id) {
    try {
      const config = await getSchedulingConfig(booking.user_id)
      await updateEvent(booking.user_id, booking.gcal_event_id, {
        start: new Date(start_time),
        end: new Date(end_time),
        timeZone: config?.timezone || 'America/Phoenix',
      })
    } catch (err) {
      console.error('[reschedule] Failed to update calendar event:', err)
    }
  }

  // Send rescheduled email
  try {
    await sendBookingEmail('rescheduled', updated)
  } catch (err) {
    console.error('[reschedule] Failed to send email:', err)
  }

  // Notify operator
  await supabase.from('notifications').insert({
    user_id: booking.user_id,
    type: 'booking_rescheduled',
    title: `Booking rescheduled: ${booking.guest_name}`,
    body: `${booking.guest_name} rescheduled from ${new Date(originalTime).toLocaleString()} to ${new Date(start_time).toLocaleString()}.`,
    data: { booking_id: booking.id },
  })

  // Log activity
  if (booking.business_id) {
    await supabase.from('activity_log').insert({
      business_id: booking.business_id,
      user_id: booking.user_id,
      event_type: 'booking_rescheduled',
      event_data: {
        guest_name: booking.guest_name,
        old_time: originalTime,
        new_time: start_time,
      },
    })
  }

  return NextResponse.json(updated)
}
