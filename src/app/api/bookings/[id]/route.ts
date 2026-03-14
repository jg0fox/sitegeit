import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteEvent } from '@/lib/services/google-calendar'

/**
 * PATCH /api/bookings/[id]
 * Updates a booking's status (cancel, mark as completed, no-show).
 * Requires authentication (operator only).
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { status } = body

  const allowedStatuses = ['confirmed', 'completed', 'no_show', 'cancelled']
  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` },
      { status: 400 }
    )
  }

  // Verify ownership
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'cancelled') {
    update.cancelled_at = new Date().toISOString()
    update.cancel_reason = body.reason || 'Cancelled by operator'

    // Delete calendar event
    if (booking.gcal_event_id) {
      try {
        await deleteEvent(user.id, booking.gcal_event_id)
      } catch (err) {
        console.error('[bookings] Failed to delete calendar event:', err)
      }
    }
  }

  const { data: updated, error } = await supabase
    .from('bookings')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
