import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots, getAvailableDays, getOperatorUserId, getSchedulingConfig } from '@/lib/services/scheduling'

/**
 * GET /api/bookings/slots?date=YYYY-MM-DD
 * GET /api/bookings/slots?month=YYYY-MM (returns available days for the month)
 *
 * Public endpoint — no auth required.
 * Returns available time slots for a specific date, or
 * available days for a given month.
 */
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  const month = request.nextUrl.searchParams.get('month')

  const userId = await getOperatorUserId()
  if (!userId) {
    return NextResponse.json({ error: 'No operator configured' }, { status: 404 })
  }

  // Return available days for a month
  if (month) {
    const [year, m] = month.split('-').map(Number)
    if (!year || !m || m < 1 || m > 12) {
      return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM.' }, { status: 400 })
    }

    const config = await getSchedulingConfig(userId)
    const days = await getAvailableDays(userId, year, m)
    return NextResponse.json({
      days,
      config: config ? {
        meeting_duration: config.meeting_duration,
        default_meeting_type: config.default_meeting_type,
        timezone: config.timezone,
        booking_page_title: config.booking_page_title,
        booking_page_subtitle: config.booking_page_subtitle,
      } : null,
    })
  }

  // Return available slots for a date
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 })
    }

    const slots = await getAvailableSlots(userId, date)
    return NextResponse.json({ slots })
  }

  return NextResponse.json({ error: 'Provide ?date=YYYY-MM-DD or ?month=YYYY-MM' }, { status: 400 })
}
