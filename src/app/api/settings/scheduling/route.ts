import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/settings/scheduling
 * Returns the user's scheduling configuration.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('scheduling_config')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Return defaults if no config exists yet
  if (!data) {
    return NextResponse.json({
      available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      available_hours: { start: '09:00', end: '17:00' },
      day_overrides: {},
      meeting_duration: 15,
      buffer_time: 15,
      min_notice: 120,
      max_advance_days: 14,
      timezone: 'America/Phoenix',
      default_meeting_type: 'zoom',
      default_location: null,
      booking_page_title: 'Book a Call',
      booking_page_subtitle: 'Pick a time that works for you.',
    })
  }

  return NextResponse.json(data)
}

/**
 * PUT /api/settings/scheduling
 * Creates or updates the user's scheduling configuration.
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const allowedFields = [
    'available_days', 'available_hours', 'day_overrides',
    'meeting_duration', 'buffer_time', 'min_notice', 'max_advance_days',
    'timezone', 'default_meeting_type', 'default_location',
    'booking_page_title', 'booking_page_subtitle',
  ]

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      update[field] = body[field]
    }
  }

  // Upsert: insert if not exists, update if exists
  const { data: existing } = await supabase
    .from('scheduling_config')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('scheduling_config')
      .update(update)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } else {
    const { data, error } = await supabase
      .from('scheduling_config')
      .insert({ user_id: user.id, ...update })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }
}
