/**
 * Booking email notifications.
 *
 * Sends transactional emails for booking confirmations,
 * rescheduling, and cancellations. Uses Resend if configured,
 * otherwise logs a warning and skips.
 */

import { getAdminClient } from '@/lib/supabase/admin'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seitgeit.vercel.app'

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

function buildEmailContent(type: EmailType, booking: BookingRecord, operatorName: string, timezone: string) {
  const { date, time } = formatDateTime(booking.start_time, timezone)
  const tzAbbr = getTimezoneAbbr(timezone)
  const rescheduleLink = `${APP_URL}/book/reschedule/${booking.reschedule_token}`
  const cancelLink = `${APP_URL}/book/cancel/${booking.cancel_token}`
  const bookingLink = `${APP_URL}/book`

  const meetingDetails = booking.zoom_join_url
    ? `Join via Zoom: ${booking.zoom_join_url}`
    : booking.meeting_type === 'phone' && booking.guest_phone
      ? `We'll call you at ${booking.guest_phone}.`
      : 'Meeting details will be shared before the call.'

  switch (type) {
    case 'confirmation':
      return {
        subject: `Your call with ${operatorName} is confirmed`,
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
          operatorName,
        ].join('\n'),
        html: `
          <p>Hi ${booking.guest_name},</p>
          <p>You're booked for <strong>${date}</strong> at <strong>${time}</strong> (${tzAbbr}).</p>
          <p>${meetingDetails.replace(booking.zoom_join_url || '', `<a href="${booking.zoom_join_url}">${booking.zoom_join_url}</a>`)}</p>
          <p>Need to change plans?<br>
          <a href="${rescheduleLink}">Reschedule</a> &middot; <a href="${cancelLink}">Cancel</a></p>
          <p>Talk soon,<br>${operatorName}</p>
        `.trim(),
      }

    case 'rescheduled': {
      return {
        subject: 'Your call has been rescheduled',
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
          <p>${meetingDetails.replace(booking.zoom_join_url || '', `<a href="${booking.zoom_join_url}">${booking.zoom_join_url}</a>`)}</p>
          <p><a href="${rescheduleLink}">Reschedule again</a> &middot; <a href="${cancelLink}">Cancel</a></p>
        `.trim(),
      }
    }

    case 'cancelled':
      return {
        subject: 'Your call has been cancelled',
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
 * Send a booking notification email.
 */
export async function sendBookingEmail(type: EmailType, booking: BookingRecord): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(`[booking-emails] RESEND_API_KEY not configured. Skipping ${type} email to ${booking.guest_email}.`)
    return
  }

  const operator = await getOperatorInfo(booking.user_id)
  const timezone = await getTimezone(booking.user_id)
  const operatorName = operator?.full_name || 'Sitegeit'
  const fromEmail = operator?.email || 'noreply@sitegeit.com'

  const { subject, text, html } = buildEmailContent(type, booking, operatorName, timezone)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${operatorName} <${fromEmail}>`,
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
