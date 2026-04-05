import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { publishToWorker } from '@/lib/qstash/client'
import { getAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
        from_email, to_emails, business_id,
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

    // Determine recipients: use explicit to_emails if set, else fall back to business.email
    const recipients: string[] = (email.to_emails as string[] | null)?.filter(Boolean) || []
    if (recipients.length === 0 && business.email) {
      recipients.push(business.email)
    }
    if (recipients.length === 0) {
      console.error(`[worker/send-email] No email for business ${business.id}`)
      return NextResponse.json({ error: 'Business has no email address' }, { status: 400 })
    }

    // Determine from address
    // Resend requires a verified domain — use simpleinstantsite.com with display name
    // Reply-to uses the operator's actual email so replies land in their inbox
    const { data: senderUser } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', business.user_id)
      .single()

    const senderName = senderUser?.full_name || 'Jason Fox'
    const fromEmail = `${senderName} <jason@simpleinstantsite.com>`
    const replyTo = senderUser?.email || null

    // Send via Resend — one send per recipient
    const emailBody = email.edited_body || email.body
    const sentAt = new Date().toISOString()
    let firstMessageId: string | null = null

    for (const recipientEmail of recipients) {
      const { data: result, error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: email.subject,
        html: emailBody,
        ...(replyTo ? { reply_to: replyTo } : {}),
      })

      if (sendError || !result) {
        console.error(`[worker/send-email] Resend error for ${recipientEmail}:`, sendError)
        throw new Error(`Failed to send to ${recipientEmail}: ${sendError?.message || 'Unknown error'}`)
      }

      console.log(`[worker/send-email] Sent ${emailId} to ${recipientEmail} via Resend: ${result.id}`)
      if (!firstMessageId) firstMessageId = result.id

      // Store in email_messages for thread tracking
      await supabase.from('email_messages').insert({
        user_id: business.user_id,
        direction: 'outbound',
        from_email: fromEmail,
        to_email: recipientEmail,
        subject: email.subject,
        body_html: emailBody,
        body_text: emailBody.replace(/<[^>]*>/g, ''),
        sent_at: sentAt,
        business_id: business.id,
        outreach_email_id: emailId,
        instantly_id: result.id,
      })
    }

    // Update email record
    await supabase
      .from('outreach_emails')
      .update({
        instantly_id: firstMessageId,
        sent_at: sentAt,
        review_status: 'sent',
      })
      .eq('id', emailId)

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
        resend_id: firstMessageId,
        sequence_position: email.sequence_position,
        from: fromEmail,
        to: recipients,
      },
    })

    // Create notification
    await supabase.from('notifications').insert({
      user_id: business.user_id,
      type: 'pipeline',
      title: 'Email sent',
      body: `Outreach email sent to ${business.name}.`,
      business_id: business.id,
      href: `/businesses/${business.id}`,
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
      resendId: firstMessageId,
      from: fromEmail,
      to: recipients,
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
