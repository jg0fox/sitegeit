import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getOperatorUserId, getSchedulingConfig } from '@/lib/services/scheduling'
import { createEvent } from '@/lib/services/google-calendar'
import { sendBookingEmail } from '@/lib/services/booking-emails'
import { createZoomMeeting } from '@/lib/services/zoom'

/**
 * POST /api/bookings
 * Creates a new booking. Public endpoint — no auth required.
 * Idempotent: if a booking already exists for this slot + email, returns existing.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { start_time, end_time, guest_name, guest_email, guest_phone, guest_message, meeting_type: requestedMeetingType, business_id } = body

  if (!start_time || !end_time || !guest_name || !guest_email) {
    return NextResponse.json(
      { error: 'Missing required fields: start_time, end_time, guest_name, guest_email' },
      { status: 400 }
    )
  }

  const userId = await getOperatorUserId()
  if (!userId) {
    return NextResponse.json({ error: 'No operator configured' }, { status: 404 })
  }

  const supabase = getAdminClient()
  const config = await getSchedulingConfig(userId)
  const validTypes = ['zoom', 'phone', 'in_person']
  const meetingType = (requestedMeetingType && validTypes.includes(requestedMeetingType))
    ? requestedMeetingType
    : (config?.default_meeting_type || 'phone')

  // Idempotency: check if booking already exists for this slot + email
  const { data: existing } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .eq('start_time', start_time)
    .eq('guest_email', guest_email)
    .in('status', ['confirmed', 'rescheduled'])
    .single()

  if (existing) {
    return NextResponse.json(existing)
  }

  // Create booking record
  const bookingData: Record<string, unknown> = {
    user_id: userId,
    start_time,
    end_time,
    meeting_type: meetingType,
    guest_name,
    guest_email,
    guest_phone: guest_phone || null,
    guest_message: guest_message || null,
    business_id: business_id || null,
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) {
    console.error('[bookings] Insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create Zoom meeting if configured and meeting type is zoom
  let zoomUrl: string | null = null
  let zoomId: string | null = null
  if (meetingType === 'zoom') {
    try {
      const zoom = await createZoomMeeting(userId, {
        topic: `Sitegeit — ${guest_name}`,
        startTime: new Date(start_time),
        duration: config?.meeting_duration || 15,
        agenda: guest_message || undefined,
      })
      if (zoom) {
        zoomUrl = zoom.join_url
        zoomId = zoom.meeting_id
        await supabase
          .from('bookings')
          .update({ zoom_join_url: zoomUrl, zoom_meeting_id: zoomId })
          .eq('id', booking.id)
        booking.zoom_join_url = zoomUrl
        booking.zoom_meeting_id = zoomId
      }
    } catch (err) {
      console.error('[bookings] Zoom meeting creation failed:', err)
    }
  }

  // Create Google Calendar event (best effort)
  try {
    const { data: operator } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    // Build event summary
    let summary = `Sitegeit — ${guest_name}`
    if (business_id) {
      const { data: biz } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', business_id)
        .single()
      if (biz?.name) summary = `Sitegeit — ${guest_name} (${biz.name})`
    }

    // Build description
    const lines = [`Booking with ${guest_name}`]
    if (guest_email) lines.push(`Email: ${guest_email}`)
    if (guest_phone) lines.push(`Phone: ${guest_phone}`)
    if (guest_message) lines.push(`\nMessage: ${guest_message}`)
    if (business_id) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'
      lines.push(`\nPipeline: ${appUrl}/pipeline/${business_id}`)
    }

    const calEvent = await createEvent(userId, {
      summary,
      description: lines.join('\n'),
      start: new Date(start_time),
      end: new Date(end_time),
      timeZone: config?.timezone || 'America/Phoenix',
      attendees: [
        { email: guest_email, displayName: guest_name },
        ...(operator?.email ? [{ email: operator.email, displayName: operator.full_name || undefined }] : []),
      ],
      location: meetingType === 'in_person' ? (config?.default_location || undefined) : undefined,
      conferenceUrl: zoomUrl || undefined,
    })

    // Store the Google Calendar event ID
    await supabase
      .from('bookings')
      .update({ gcal_event_id: calEvent.id })
      .eq('id', booking.id)

    booking.gcal_event_id = calEvent.id
  } catch (err) {
    console.error('[bookings] Google Calendar event creation failed:', err)
    // Continue — booking is still valid without calendar event
  }

  // If linked to a business, update pipeline status
  if (business_id) {
    await supabase
      .from('businesses')
      .update({ status: 'meeting_scheduled' })
      .eq('id', business_id)

    await supabase.from('activity_log').insert({
      business_id,
      user_id: userId,
      event_type: 'status_changed',
      event_data: {
        old_status: null,
        new_status: 'meeting_scheduled',
        trigger: 'booking_created',
        guest_name,
      },
    })
  }

  // Create notification for operator
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'booking_created',
    title: `New booking: ${guest_name}`,
    body: `${guest_name} booked a ${config?.meeting_duration || 15}-minute call on ${new Date(start_time).toLocaleDateString()}.`,
    data: { booking_id: booking.id, business_id },
  })

  // Send confirmation email to guest
  try {
    await sendBookingEmail('confirmation', booking)
  } catch (err) {
    console.error('[bookings] Confirmation email failed:', err)
  }

  return NextResponse.json(booking, { status: 201 })
}

/**
 * GET /api/bookings
 * Returns bookings for the authenticated operator.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get('status')
  const upcoming = request.nextUrl.searchParams.get('upcoming')

  let query = supabase
    .from('bookings')
    .select('*, businesses(id, name, category)')
    .eq('user_id', user.id)
    .order('start_time', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  if (upcoming === 'true') {
    query = query
      .in('status', ['confirmed', 'rescheduled'])
      .gte('start_time', new Date().toISOString())
      .limit(10)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
