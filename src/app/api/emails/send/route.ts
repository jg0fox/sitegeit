import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/services/instantly'

/**
 * POST /api/emails/send
 * Unified email send endpoint. Sends an email via Instantly and
 * stores it in email_messages for thread tracking.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { from_email, to_email, subject, body, business_id, booking_id } = await request.json()

  if (!from_email || !to_email || !subject || !body) {
    return NextResponse.json(
      { error: 'Missing required fields: from_email, to_email, subject, body' },
      { status: 400 }
    )
  }

  try {
    const result = await sendEmail({
      from_email,
      to: to_email,
      subject,
      body,
    })

    // Store in email_messages
    const admin = getAdminClient()
    await admin.from('email_messages').insert({
      user_id: user.id,
      direction: 'outbound',
      from_email,
      to_email,
      subject,
      body_html: body,
      body_text: body.replace(/<[^>]*>/g, ''),
      sent_at: new Date().toISOString(),
      business_id: business_id || null,
      booking_id: booking_id || null,
    })

    // Log to activity_log if linked to a business
    if (business_id) {
      await admin.from('activity_log').insert({
        business_id,
        user_id: user.id,
        event_type: 'email_sent',
        event_data: {
          subject,
          from_email,
          to_email,
          trigger: 'manual_send',
        },
      })
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (err) {
    console.error('[emails/send] Send failed:', err)
    const message = err instanceof Error ? err.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
