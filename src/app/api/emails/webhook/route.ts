import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature } from '@/lib/services/instantly'

/**
 * POST /api/emails/webhook
 * Receives email engagement events from Instantly.ai webhooks.
 * Updates outreach_emails, progresses business status, cancels
 * follow-ups on reply, and creates notifications.
 */

// Map Instantly webhook event names to our internal event types
const EVENT_MAP: Record<string, string> = {
  'email.opened': 'email_opened',
  'email.clicked': 'email_clicked',
  'email.replied': 'email_replied',
  'email.bounced': 'email_bounced',
}

// Status progression: when engagement events occur, advance business status
const STATUS_PROGRESSION: Record<string, { from: string[]; to: string }> = {
  email_opened: { from: ['sent'], to: 'opened' },
  email_clicked: { from: ['sent', 'opened'], to: 'clicked' },
  email_replied: { from: ['sent', 'opened', 'clicked'], to: 'responded' },
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()

    // Verify Instantly webhook signature (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      const signature = request.headers.get('x-instantly-signature') || ''
      const valid = await verifyWebhookSignature(rawBody, signature)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)

    // Instantly sends { event: "email.opened", data: { ... } }
    // Also support our internal format { event_type, email_id, business_id }
    const instantlyEvent = payload.event as string | undefined
    const eventType = instantlyEvent
      ? EVENT_MAP[instantlyEvent]
      : (payload.event_type as string | undefined)

    if (!eventType) {
      return NextResponse.json({ error: 'Unknown or missing event type' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Resolve the email record — by instantly_id (from Instantly) or direct email_id
    const instantlyId = payload.data?.email_id || payload.data?.message_id
    const directEmailId = payload.email_id

    let emailRecord: {
      id: string
      business_id: string
      sequence_position: number
      parent_email_id: string | null
    } | null = null

    if (instantlyId) {
      const { data } = await supabase
        .from('outreach_emails')
        .select('id, business_id, sequence_position, parent_email_id')
        .eq('instantly_id', instantlyId)
        .single()
      emailRecord = data
    } else if (directEmailId) {
      const { data } = await supabase
        .from('outreach_emails')
        .select('id, business_id, sequence_position, parent_email_id')
        .eq('id', directEmailId)
        .single()
      emailRecord = data
    }

    if (!emailRecord) {
      console.warn(
        `[email/webhook] No matching email for instantly_id=${instantlyId} email_id=${directEmailId}`
      )
      return NextResponse.json({ success: true, matched: false })
    }

    const emailId = emailRecord.id
    const businessId = emailRecord.business_id

    // Update outreach_emails based on event
    switch (eventType) {
      case 'email_opened':
        await supabase.rpc('increment_open_count', { email_id: emailId })
        break
      case 'email_clicked':
        await supabase.rpc('increment_click_count', { email_id: emailId })
        break
      case 'email_replied':
        await supabase
          .from('outreach_emails')
          .update({ replied_at: new Date().toISOString() })
          .eq('id', emailId)
        break
      case 'email_bounced':
        await supabase
          .from('outreach_emails')
          .update({ bounced: true })
          .eq('id', emailId)
        break
    }

    // Progress business status
    const progression = STATUS_PROGRESSION[eventType]
    if (progression) {
      const { data: business } = await supabase
        .from('businesses')
        .select('status')
        .eq('id', businessId)
        .single()

      if (business && progression.from.includes(business.status)) {
        await supabase
          .from('businesses')
          .update({
            status: progression.to,
            ...(eventType === 'email_replied'
              ? { responded_at: new Date().toISOString() }
              : {}),
          })
          .eq('id', businessId)
      }
    }

    // Cancel pending follow-ups on reply
    if (eventType === 'email_replied') {
      const primaryEmailId = emailRecord.parent_email_id || emailRecord.id
      await supabase
        .from('outreach_emails')
        .update({ review_status: 'skipped' })
        .eq('parent_email_id', primaryEmailId)
        .is('sent_at', null)
    }

    // Fetch business info for notifications and activity logging
    const { data: business } = await supabase
      .from('businesses')
      .select('user_id, name')
      .eq('id', businessId)
      .single()

    if (business?.user_id) {
      // Create notification for reply and bounce events
      if (eventType === 'email_replied' || eventType === 'email_bounced') {
        const isReply = eventType === 'email_replied'
        await supabase.from('notifications').insert({
          user_id: business.user_id,
          type: 'engagement',
          title: isReply ? 'New reply' : 'Email bounced',
          body: isReply
            ? `${business.name} replied to your outreach email.`
            : `Email to ${business.name} bounced. Check the email address.`,
          business_id: businessId,
          href: `/pipeline/${businessId}`,
        })
      }

      // Log activity for all engagement events
      await supabase.from('activity_log').insert({
        business_id: businessId,
        user_id: business.user_id,
        event_type: eventType,
        event_data: { business_name: business.name, email_id: emailId },
      })
    }

    return NextResponse.json({ success: true, matched: true, eventType })
  } catch (err) {
    console.error('[email/webhook] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
