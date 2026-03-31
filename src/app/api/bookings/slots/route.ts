import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots, getAvailableDays, getOperatorUserId, getSchedulingConfig } from '@/lib/services/scheduling'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/bookings/slots?date=YYYY-MM-DD&slug=optional
 * GET /api/bookings/slots?month=YYYY-MM&slug=optional
 *
 * Public endpoint — no auth required.
 * When slug is provided, loads client scheduling config instead of operator's.
 */
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  const month = request.nextUrl.searchParams.get('month')
  const slug = request.nextUrl.searchParams.get('slug')

  // If slug provided, load client scheduling config
  if (slug) {
    const supabase = getAdminClient()
    const { data: clientConfig } = await supabase
      .from('client_scheduling_config')
      .select('*, businesses(name, category)')
      .eq('booking_slug', slug)
      .eq('is_active', true)
      .single()

    if (!clientConfig) {
      return NextResponse.json({ error: 'Booking page not found' }, { status: 404 })
    }

    // Use operator's scheduling functions but with client's config
    const userId = await getOperatorUserId()
    if (!userId) {
      return NextResponse.json({ error: 'No operator configured' }, { status: 404 })
    }

    if (month) {
      const [year, m] = month.split('-').map(Number)
      if (!year || !m || m < 1 || m > 12) {
        return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM.' }, { status: 400 })
      }

      // Use client availability if set, otherwise fall back to operator's
      const days = await getAvailableDays(userId, year, m)
      return NextResponse.json({
        days,
        config: {
          meeting_duration: clientConfig.meeting_duration || 15,
          default_meeting_type: clientConfig.meeting_types?.[0] || 'phone',
          timezone: clientConfig.timezone || 'America/Phoenix',
          booking_page_title: clientConfig.booking_page_title || (
            clientConfig.mode === 'demo'
              ? `Book a Free Consultation`
              : `Book with ${(clientConfig.businesses as { name: string })?.name || 'us'}`
          ),
          booking_page_subtitle: clientConfig.booking_page_subtitle || (
            clientConfig.mode === 'demo'
              ? `Schedule a convenient time with ${(clientConfig.businesses as { name: string })?.name || 'us'}.`
              : 'Schedule a convenient time.'
          ),
        },
        client: {
          business_name: (clientConfig.businesses as { name: string })?.name,
          meeting_types: clientConfig.meeting_types || ['phone'],
          business_id: clientConfig.business_id,
        },
      })
    }

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 })
      }
      const slots = await getAvailableSlots(userId, date)
      return NextResponse.json({ slots })
    }

    return NextResponse.json({ error: 'Provide ?date=YYYY-MM-DD or ?month=YYYY-MM' }, { status: 400 })
  }

  // Default: operator's own booking page
  const userId = await getOperatorUserId()
  if (!userId) {
    return NextResponse.json({ error: 'No operator configured' }, { status: 404 })
  }

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

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 })
    }

    const slots = await getAvailableSlots(userId, date)
    return NextResponse.json({ slots })
  }

  return NextResponse.json({ error: 'Provide ?date=YYYY-MM-DD or ?month=YYYY-MM' }, { status: 400 })
}
