import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('client_scheduling_config')
    .select('*')
    .eq('business_id', businessId)
    .single()

  // Default mode for rows that predate the migration
  if (data && !data.mode) {
    data.mode = data.is_active ? 'configured' : 'off'
  }

  return NextResponse.json(data || null)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('user_id, name')
    .eq('id', businessId)
    .single()

  if (!business || business.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const mode = body.mode || 'configured'

  // Auto-generate slug from business name
  const autoSlug = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  if (mode === 'off') {
    // Simple: set inactive
    const payload = {
      business_id: businessId,
      mode: 'off',
      is_active: false,
      booking_slug: body.booking_slug || autoSlug,
      contact_email: body.contact_email || null,
      timezone: body.timezone || 'America/Phoenix',
      meeting_duration: body.meeting_duration || 15,
      meeting_types: body.meeting_types || ['phone'],
      availability: body.availability || null,
      booking_page_title: body.booking_page_title || null,
      booking_page_subtitle: body.booking_page_subtitle || null,
    }

    return await upsertConfig(supabase, businessId, payload)
  }

  if (mode === 'demo') {
    // Demo: auto-generate slug, use operator email, no validation required
    const payload = {
      business_id: businessId,
      mode: 'demo',
      is_active: true,
      booking_slug: body.booking_slug || autoSlug,
      contact_email: body.contact_email || user.email || null,
      timezone: body.timezone || 'America/Phoenix',
      meeting_duration: body.meeting_duration || 15,
      meeting_types: body.meeting_types || ['phone'],
      availability: body.availability || null,
      booking_page_title: body.booking_page_title || null,
      booking_page_subtitle: body.booking_page_subtitle || null,
    }

    return await upsertConfig(supabase, businessId, payload)
  }

  // Configured mode: full validation
  const {
    contact_email,
    timezone,
    meeting_duration,
    meeting_types,
    availability,
    booking_slug,
    booking_page_title,
    booking_page_subtitle,
    is_active,
  } = body

  if (!contact_email) {
    return NextResponse.json({ error: 'Contact email is required' }, { status: 400 })
  }

  const payload = {
    business_id: businessId,
    mode: 'configured',
    contact_email,
    timezone: timezone || 'America/Phoenix',
    meeting_duration: meeting_duration || 15,
    meeting_types: meeting_types || ['phone'],
    availability: availability || null,
    booking_slug: booking_slug || autoSlug,
    booking_page_title: booking_page_title || null,
    booking_page_subtitle: booking_page_subtitle || null,
    is_active: is_active !== false,
  }

  return await upsertConfig(supabase, businessId, payload)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertConfig(supabase: any, businessId: string, payload: Record<string, unknown>) {
  const { data: existing } = await supabase
    .from('client_scheduling_config')
    .select('id')
    .eq('business_id', businessId)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('client_scheduling_config')
      .update(payload)
      .eq('business_id', businessId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message.includes('booking_slug')) {
        return NextResponse.json({ error: 'This booking URL is already taken' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } else {
    const { data, error } = await supabase
      .from('client_scheduling_config')
      .insert(payload)
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message.includes('booking_slug')) {
        return NextResponse.json({ error: 'This booking URL is already taken' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }
}
