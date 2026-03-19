import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * POST /api/sites/contact
 * Handles contact form submissions from client sites.
 * Public endpoint — no auth required.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { business_id, name, email, phone, message } = body

  if (!business_id || !name || !email || !message) {
    return NextResponse.json(
      { error: 'Missing required fields: business_id, name, email, message' },
      { status: 400 }
    )
  }

  const supabase = getAdminClient()

  // Look up business and contact email
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, email, contact_email, user_id')
    .eq('id', business_id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Check for client scheduling config contact email as secondary fallback
  const { data: schedConfig } = await supabase
    .from('client_scheduling_config')
    .select('contact_email')
    .eq('business_id', business_id)
    .single()

  // Fallback chain: business.contact_email → scheduling config → business.email (outreach)
  const recipientEmail = business.contact_email || schedConfig?.contact_email || business.email
  if (!recipientEmail) {
    return NextResponse.json({ error: 'No contact email configured for this business' }, { status: 500 })
  }

  // Store submission
  await supabase.from('contact_submissions').insert({
    business_id,
    guest_name: name,
    guest_email: email,
    guest_phone: phone || null,
    message,
  })

  // Send notification email to business owner
  if (resend) {
    try {
      await resend.emails.send({
        from: `${business.name} <noreply@simpleinstantsite.com>`,
        replyTo: email,
        to: recipientEmail,
        subject: `New message from ${name}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b; font-size: 18px;">New message from your website</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top; width: 100px;">Name</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Email</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Phone</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${escapeHtml(phone)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Message</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; white-space: pre-wrap;">${escapeHtml(message)}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">
              This message was sent via the contact form on your ${escapeHtml(business.name)} website.
            </p>
          </div>
        `,
      })
    } catch (err) {
      console.error('[contact] Resend email to business failed:', err)
    }

    // Send confirmation email to the person who submitted the form
    try {
      await resend.emails.send({
        from: `${business.name} <noreply@simpleinstantsite.com>`,
        to: email,
        subject: `We received your message — ${business.name}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b; font-size: 18px;">Thanks for reaching out, ${escapeHtml(name)}!</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              We received your message and will follow up within one business day — usually sooner.
            </p>
            <p style="color: #64748b; font-size: 13px; margin-top: 16px;">Here's a copy of what you sent:</p>
            <blockquote style="border-left: 3px solid #e2e8f0; padding-left: 12px; margin: 12px 0; color: #475569; font-size: 14px; white-space: pre-wrap;">${escapeHtml(message)}</blockquote>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 14px; color: #1e293b;">
              Best regards,<br>${escapeHtml(business.name)}
            </p>
          </div>
        `,
      })
    } catch (err) {
      console.error('[contact] Resend confirmation to guest failed:', err)
    }
  } else {
    console.warn('[contact] No RESEND_API_KEY configured — emails not sent')
  }

  // Create notification for operator
  await supabase.from('notifications').insert({
    user_id: business.user_id,
    type: 'contact_form',
    title: `Contact form: ${name}`,
    body: `${name} submitted a message via the ${business.name} website.`,
    data: { business_id, guest_email: email },
  })

  return NextResponse.json({ success: true })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
