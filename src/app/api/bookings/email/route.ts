import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/services/instantly'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/bookings/email
 * Send an email to a booking guest via Instantly.ai.
 * Requires authentication (operator only).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { booking_id, from_email, to_email, subject, body } = await request.json()

  if (!booking_id || !from_email || !to_email || !subject || !body) {
    return NextResponse.json(
      { error: 'Missing required fields: booking_id, from_email, to_email, subject, body' },
      { status: 400 }
    )
  }

  // Verify the booking belongs to this user
  const admin = getAdminClient()
  const { data: booking } = await admin
    .from('bookings')
    .select('id, user_id, guest_name, business_id')
    .eq('id', booking_id)
    .eq('user_id', user.id)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  try {
    const result = await sendEmail({
      from_email,
      to: to_email,
      subject,
      body,
    })

    // Store in email_messages for thread tracking
    await admin.from('email_messages').insert({
      user_id: user.id,
      direction: 'outbound',
      from_email,
      to_email,
      subject,
      body_html: body,
      body_text: body.replace(/<[^>]*>/g, ''),
      sent_at: new Date().toISOString(),
      business_id: booking.business_id || null,
      booking_id,
    })

    // Log the email send in activity log if linked to a business
    if (booking.business_id) {
      await admin.from('activity_log').insert({
        business_id: booking.business_id,
        user_id: user.id,
        event_type: 'email_sent',
        event_data: {
          booking_id,
          subject,
          from_email,
          to_email,
          instantly_id: result.id,
          trigger: 'booking_email',
        },
      })
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (err) {
    console.error('[bookings/email] Send failed:', err)
    const message = err instanceof Error ? err.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
