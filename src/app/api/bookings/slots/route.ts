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
      .select('*, businesses(id, name, category, category_slug)')
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

      // Fetch branding from the business's generated site theme config
      const business = clientConfig.businesses as { id: string; name: string; category_slug?: string } | null
      let branding: { business_name: string; primary_color: string; primary_dark: string; font_heading: string } | null = null
      if (business?.id) {
        const { data: site } = await supabase
          .from('generated_sites')
          .select('theme_config')
          .eq('business_id', business.id)
          .eq('deploy_status', 'live')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (site?.theme_config) {
          const tc = site.theme_config as {
            designSystem?: string
            cssVars?: Record<string, string>
            palette?: { onPrimaryFixed?: string; primary?: string }
            colors?: { primary?: string; primaryHover?: string }
            typography?: { headingFont?: string }
          }
          if (tc.designSystem === 'editorial') {
            branding = {
              business_name: business.name,
              primary_color: tc.palette?.onPrimaryFixed || '#101c2c',
              primary_dark: tc.palette?.primary || '#535f71',
              font_heading: "'Epilogue', system-ui, sans-serif",
            }
          } else if (tc.cssVars) {
            branding = {
              business_name: business.name,
              primary_color: tc.cssVars['--color-primary'] || '#2563eb',
              primary_dark: tc.cssVars['--color-primary-hover'] || '#1e40af',
              font_heading: tc.cssVars['--font-heading'] || "'Fraunces', Georgia, serif",
            }
          }
        }
      }

      return NextResponse.json({
        days,
        config: {
          meeting_duration: clientConfig.meeting_duration || 15,
          default_meeting_type: clientConfig.meeting_types?.[0] || 'phone',
          timezone: clientConfig.timezone || 'America/Phoenix',
          booking_page_title: clientConfig.booking_page_title || (
            clientConfig.mode === 'demo'
              ? `Book a Free Consultation`
              : `Book with ${business?.name || 'us'}`
          ),
          booking_page_subtitle: clientConfig.booking_page_subtitle || (
            clientConfig.mode === 'demo'
              ? `Schedule a convenient time with ${business?.name || 'us'}.`
              : 'Schedule a convenient time.'
          ),
        },
        client: {
          business_name: business?.name,
          meeting_types: clientConfig.meeting_types || ['phone'],
          business_id: clientConfig.business_id,
          branding,
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
