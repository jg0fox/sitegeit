import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { publishToWorker } from '@/lib/qstash/client'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/services/instantly'

async function handler(request: Request) {
  try {
    const data = await request.json()
    const emailId = data.emailId as string

    if (!emailId) {
      return NextResponse.json({ error: 'Missing emailId' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Fetch the email with business details
    const { data: email, error: emailError } = await supabase
      .from('outreach_emails')
      .select(`
        id, subject, body, edited_body, review_status,
        sequence_position, parent_email_id, instantly_id,
        business_id,
        businesses!inner(id, user_id, name, email, status)
      `)
      .eq('id', emailId)
      .single()

    if (emailError || !email) {
      return NextResponse.json({ error: `Email not found: ${emailError?.message}` }, { status: 404 })
    }

    const business = email.businesses as unknown as {
      id: string; user_id: string; name: string; email: string; status: string
    }

    // For follow-ups: check if business already replied (cancel if so)
    if (email.sequence_position > 1) {
      const { data: parentEmail } = await supabase
        .from('outreach_emails')
        .select('id')
        .eq('business_id', email.business_id)
        .eq('sequence_position', 1)
        .not('replied_at', 'is', null)
        .single()

      if (parentEmail) {
        console.log(`[worker/send-email] Skipping follow-up ${emailId} — business already replied`)
        await supabase
          .from('outreach_emails')
          .update({ review_status: 'skipped' })
          .eq('id', emailId)
        return NextResponse.json({ success: true, skipped: true, reason: 'replied' })
      }

      // Also skip if this email was cancelled/skipped
      if (email.review_status === 'skipped') {
        console.log(`[worker/send-email] Skipping ${emailId} — already marked skipped`)
        return NextResponse.json({ success: true, skipped: true, reason: 'already_skipped' })
      }
    }

    // Already sent? Don't double-send
    if (email.instantly_id) {
      console.log(`[worker/send-email] Email ${emailId} already sent (${email.instantly_id})`)
      return NextResponse.json({ success: true, skipped: true, reason: 'already_sent' })
    }

    if (!business.email) {
      console.error(`[worker/send-email] No email for business ${business.id}`)
      return NextResponse.json({ error: 'Business has no email address' }, { status: 400 })
    }

    // Pick the best sending domain: prefer 'ready' warmup, then fall back to 'warming'
    const { data: domains } = await supabase
      .from('sending_domains')
      .select('*')
      .eq('user_id', business.user_id)
      .in('warmup_status', ['ready', 'warming'])
      .order('health_score', { ascending: false, nullsFirst: false })

    // Find first domain under its daily limit, preferring 'ready' status
    const sendingDomain = domains
      ?.sort((a, b) => {
        if (a.warmup_status === 'ready' && b.warmup_status !== 'ready') return -1
        if (b.warmup_status === 'ready' && a.warmup_status !== 'ready') return 1
        return 0
      })
      .find((d) => d.emails_sent_today < d.daily_send_limit)

    if (!sendingDomain) {
      console.error(`[worker/send-email] No sending domain available for user ${business.user_id}`)
      return NextResponse.json(
        { error: domains?.length ? 'Daily send limit reached' : 'No sending domain available' },
        { status: domains?.length ? 429 : 400 }
      )
    }

    // Send via Instantly
    const emailBody = email.edited_body || email.body
    const result = await sendEmail({
      from_email: sendingDomain.email_address,
      to: business.email,
      subject: email.subject,
      body: emailBody,
    })

    console.log(`[worker/send-email] Sent ${emailId} via Instantly: ${result.id}`)

    // Update email record
    await supabase
      .from('outreach_emails')
      .update({
        instantly_id: result.id,
        sent_at: new Date().toISOString(),
        review_status: 'sent',
      })
      .eq('id', emailId)

    // Increment sent today
    await supabase.rpc('increment_sent_today', { domain_id: sendingDomain.id })

    // Update business status to 'sent' if not already past that
    const PRE_SENT_STATUSES = ['discovered', 'enriching', 'enriched', 'generating', 'review_ready']
    if (PRE_SENT_STATUSES.includes(business.status)) {
      await supabase
        .from('businesses')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', business.id)
    }

    // Log activity
    await supabase.from('activity_log').insert({
      business_id: business.id,
      user_id: business.user_id,
      event_type: 'email_sent',
      event_data: {
        email_id: emailId,
        instantly_id: result.id,
        sequence_position: email.sequence_position,
        from: sendingDomain.email_address,
        to: business.email,
      },
    })

    // Create notification
    await supabase.from('notifications').insert({
      user_id: business.user_id,
      type: 'pipeline',
      title: 'Email sent',
      body: `Outreach email sent to ${business.name}.`,
      business_id: business.id,
      href: `/pipeline/${business.id}`,
    })

    // Queue follow-ups with delay if this is the primary email
    if (email.sequence_position === 1) {
      const { data: followUps } = await supabase
        .from('outreach_emails')
        .select('id, sequence_position')
        .eq('parent_email_id', emailId)
        .eq('review_status', 'approved')
        .order('sequence_position', { ascending: true })

      if (followUps) {
        for (const fu of followUps) {
          // Follow-up 1: 3 days, Follow-up 2: 8 days (3 + 5)
          const delayDays = fu.sequence_position === 2 ? 3 : 8
          const delaySecs = delayDays * 86400
          const messageId = await publishToWorker(
            'send-email',
            { emailId: fu.id },
            { delay: delaySecs }
          )
          console.log(`[worker/send-email] Queued follow-up ${fu.id} (pos ${fu.sequence_position}) with ${delayDays}d delay: ${messageId}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailId,
      instantlyId: result.id,
      from: sendingDomain.email_address,
      to: business.email,
    })
  } catch (err) {
    console.error('[worker/send-email] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const POST = process.env.NODE_ENV === 'development'
  ? handler
  : verifySignatureAppRouter(handler)
