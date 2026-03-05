import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

// TODO: Phase 5 — Integrate with Instantly.ai webhook events
// This endpoint receives email engagement events (opens, clicks, replies, bounces)
// and updates outreach_emails + creates notifications accordingly.

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event_type, email_id, business_id } = body as {
      event_type: string
      email_id?: string
      business_id?: string
    }

    if (!event_type) {
      return NextResponse.json({ error: 'Missing event_type' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Update outreach_emails based on event
    if (email_id) {
      switch (event_type) {
        case 'email_opened':
          await supabase.rpc('increment_open_count', { email_id })
          break
        case 'email_clicked':
          await supabase.rpc('increment_click_count', { email_id })
          break
        case 'email_replied':
          await supabase
            .from('outreach_emails')
            .update({ replied_at: new Date().toISOString() })
            .eq('id', email_id)
          break
        case 'email_bounced':
          await supabase
            .from('outreach_emails')
            .update({ bounced: true })
            .eq('id', email_id)
          break
      }
    }

    // Create notification for reply and bounce events
    if (business_id && (event_type === 'email_replied' || event_type === 'email_bounced')) {
      const { data: business } = await supabase
        .from('businesses')
        .select('user_id, name')
        .eq('id', business_id)
        .single()

      if (business?.user_id) {
        const isReply = event_type === 'email_replied'
        await supabase.from('notifications').insert({
          user_id: business.user_id,
          type: 'engagement',
          title: isReply ? 'New reply' : 'Email bounced',
          body: isReply
            ? `${business.name} replied to your outreach email.`
            : `Email to ${business.name} bounced. Check the email address.`,
          business_id,
          href: `/pipeline/${business_id}`,
        })
      }

      // Log activity
      if (business?.user_id) {
        await supabase.from('activity_log').insert({
          business_id,
          user_id: business.user_id,
          event_type,
          event_data: { business_name: business.name, email_id },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[email/webhook] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
