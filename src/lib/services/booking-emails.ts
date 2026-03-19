/**
 * Booking email notifications.
 *
 * Sends transactional emails for booking confirmations,
 * rescheduling, and cancellations. Uses Resend if configured,
 * otherwise logs a warning and skips.
 */

import { getAdminClient } from '@/lib/supabase/admin'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://goget.im'

interface BookingRecord {
  id: string
  user_id: string
  start_time: string
  end_time: string
  guest_name: string
  guest_email: string
  guest_phone?: string | null
  meeting_type: string
  zoom_join_url?: string | null
  reschedule_token: string
  cancel_token: string
  rescheduled_from?: string | null
}

type EmailType = 'confirmation' | 'rescheduled' | 'cancelled'

function formatDateTime(isoString: string, timezone: string): { date: string; time: string } {
  const d = new Date(isoString)
  return {
    date: d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone,
    }),
    time: d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
      hour12: true,
    }),
  }
}

function getTimezoneAbbr(timezone: string): string {
  const parts = new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' }).split(' ')
  return parts[parts.length - 1] || timezone
}

async function getOperatorInfo(userId: string) {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .single()
  return data
}

async function getTimezone(userId: string): Promise<string> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('scheduling_config')
    .select('timezone')
    .eq('user_id', userId)
    .single()
  return data?.timezone || 'America/Phoenix'
}

function buildMeetingDetails(booking: BookingRecord): string {
  if (booking.zoom_join_url) {
    return `Join via Zoom: ${booking.zoom_join_url}`
  }
  if (booking.meeting_type === 'phone' && booking.guest_phone) {
    return `We'll call you at ${booking.guest_phone}.`
  }
  return 'Meeting details will be shared before the call.'
}

function buildMeetingDetailsHtml(booking: BookingRecord): string {
  if (booking.zoom_join_url) {
    return `Join via Zoom: <a href="${booking.zoom_join_url}">${booking.zoom_join_url}</a>`
  }
  if (booking.meeting_type === 'phone' && booking.guest_phone) {
    return `We'll call you at ${booking.guest_phone}.`
  }
  return 'Meeting details will be shared before the call.'
}

function buildEmailContent(type: EmailType, booking: BookingRecord, displayName: string, timezone: string) {
  const { date, time } = formatDateTime(booking.start_time, timezone)
  const tzAbbr = getTimezoneAbbr(timezone)
  const rescheduleLink = `${APP_URL}/book/reschedule/${booking.reschedule_token}`
  const cancelLink = `${APP_URL}/book/cancel/${booking.cancel_token}`
  const bookingLink = `${APP_URL}/book`

  const meetingDetails = buildMeetingDetails(booking)
  const meetingDetailsHtml = buildMeetingDetailsHtml(booking)

  switch (type) {
    case 'confirmation':
      return {
        subject: `Your call with ${displayName} is confirmed`,
        text: [
          `Hi ${booking.guest_name},`,
          '',
          `You're booked for ${date} at ${time} (${tzAbbr}).`,
          '',
          meetingDetails,
          '',
          'Need to change plans?',
          `Reschedule: ${rescheduleLink}`,
          `Cancel: ${cancelLink}`,
          '',
          'Talk soon,',
          displayName,
        ].join('\n'),
        html: `
          <p>Hi ${booking.guest_name},</p>
          <p>You're booked for <strong>${date}</strong> at <strong>${time}</strong> (${tzAbbr}).</p>
          <p>${meetingDetailsHtml}</p>
          <p>Need to change plans?<br>
          <a href="${rescheduleLink}">Reschedule</a> &middot; <a href="${cancelLink}">Cancel</a></p>
          <p>Talk soon,<br>${displayName}</p>
        `.trim(),
      }

    case 'rescheduled': {
      return {
        subject: `Your call with ${displayName} has been rescheduled`,
        text: [
          `Hi ${booking.guest_name},`,
          '',
          `Your call has been moved to ${date} at ${time} (${tzAbbr}).`,
          '',
          meetingDetails,
          '',
          `Reschedule again: ${rescheduleLink}`,
          `Cancel: ${cancelLink}`,
        ].join('\n'),
        html: `
          <p>Hi ${booking.guest_name},</p>
          <p>Your call has been moved to <strong>${date}</strong> at <strong>${time}</strong> (${tzAbbr}).</p>
          <p>${meetingDetailsHtml}</p>
          <p><a href="${rescheduleLink}">Reschedule again</a> &middot; <a href="${cancelLink}">Cancel</a></p>
        `.trim(),
      }
    }

    case 'cancelled':
      return {
        subject: `Your call with ${displayName} has been cancelled`,
        text: [
          `Hi ${booking.guest_name},`,
          '',
          `Your call on ${date} at ${time} has been cancelled.`,
          '',
          `Want to book a new time? ${bookingLink}`,
        ].join('\n'),
        html: `
          <p>Hi ${booking.guest_name},</p>
          <p>Your call on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
          <p><a href="${bookingLink}">Book a new time</a></p>
        `.trim(),
      }
  }
}

/**
 * Send a booking email to the guest.
 *
 * If businessName is provided (client site booking), use it as the display name.
 * Otherwise fall back to operator name (Simple Instant Site marketing booking).
 */
export async function sendBookingEmail(
  type: EmailType,
  booking: BookingRecord,
  businessName?: string,
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(`[booking-emails] RESEND_API_KEY not configured. Skipping ${type} email to ${booking.guest_email}.`)
    return
  }

  const operator = await getOperatorInfo(booking.user_id)
  const timezone = await getTimezone(booking.user_id)
  const displayName = businessName || operator?.full_name || 'Simple Instant Site'
  const replyToEmail = operator?.email || undefined

  const { subject, text, html } = buildEmailContent(type, booking, displayName, timezone)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${displayName} <noreply@simpleinstantsite.com>`,
      replyTo: replyToEmail,
      to: [booking.guest_email],
      subject,
      text,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Resend API error (${res.status}): ${err}`)
  }

  console.log(`[booking-emails] Sent ${type} email to ${booking.guest_email}`)
}

/**
 * Send a notification email to the client (business owner)
 * when a customer books through their site.
 */
export async function sendClientBookingNotification(
  booking: BookingRecord,
  businessId: string,
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(`[booking-emails] RESEND_API_KEY not configured. Skipping client notification.`)
    return
  }

  const supabase = getAdminClient()

  // Look up business contact_email (single source of truth), then fall back
  // to scheduling config contact_email, then business outreach email
  const { data: business } = await supabase
    .from('businesses')
    .select('name, contact_email, email')
    .eq('id', businessId)
    .single()

  const { data: schedConfig } = await supabase
    .from('client_scheduling_config')
    .select('contact_email')
    .eq('business_id', businessId)
    .single()

  const recipientEmail = business?.contact_email || schedConfig?.contact_email || business?.email

  if (!recipientEmail) {
    console.warn(`[booking-emails] No contact email found for business ${businessId}. Skipping client notification.`)
    return
  }

  const businessName = business?.name || 'your business'
  const timezone = await getTimezone(booking.user_id)
  const { date, time } = formatDateTime(booking.start_time, timezone)
  const tzAbbr = getTimezoneAbbr(timezone)
  const meetingLabel = booking.meeting_type === 'zoom' ? 'Zoom' : booking.meeting_type === 'phone' ? 'Phone' : 'In person'

  const subject = `New booking: ${booking.guest_name} — ${date}`
  const text = [
    `New booking for ${businessName}`,
    '',
    `${booking.guest_name} has booked a ${meetingLabel.toLowerCase()} meeting.`,
    '',
    `Date: ${date}`,
    `Time: ${time} (${tzAbbr})`,
    `Email: ${booking.guest_email}`,
    ...(booking.guest_phone ? [`Phone: ${booking.guest_phone}`] : []),
    '',
    'You can manage this booking from your dashboard.',
  ].join('\n')

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b; font-size: 18px;">New booking for ${escapeHtml(businessName)}</h2>
      <p style="color: #334155;">${escapeHtml(booking.guest_name)} has booked a ${meetingLabel.toLowerCase()} meeting.</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top; width: 80px;">Date</td>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px;"><strong>${date}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Time</td>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${time} (${tzAbbr})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Name</td>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${escapeHtml(booking.guest_name)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Email</td>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px;"><a href="mailto:${escapeHtml(booking.guest_email)}">${escapeHtml(booking.guest_email)}</a></td>
        </tr>
        ${booking.guest_phone ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Phone</td>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${escapeHtml(booking.guest_phone)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Type</td>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${meetingLabel}</td>
        </tr>
      </table>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">
        This booking was made through the ${escapeHtml(businessName)} website, powered by Simple Instant Site.
      </p>
    </div>
  `.trim()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${businessName} Bookings <noreply@simpleinstantsite.com>`,
      replyTo: booking.guest_email,
      to: [recipientEmail],
      subject,
      text,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Resend API error (${res.status}): ${err}`)
  }

  console.log(`[booking-emails] Sent client notification to ${recipientEmail} for business ${businessId}`)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
