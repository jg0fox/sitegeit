import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { tier, monthly_rate, custom_domain, note } = body as {
    tier: string
    monthly_rate: number
    custom_domain?: string
    note?: string
  }

  if (!tier || !['starter', 'growth', 'pro', 'premium'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const now = new Date().toISOString()

  // Update business to active client
  const { data: updated, error } = await supabase
    .from('businesses')
    .update({
      status: 'active',
      tier,
      monthly_rate: monthly_rate || 25,
      converted_at: now,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Set custom domain on generated site if provided
  if (custom_domain && tier !== 'starter') {
    const cleaned = custom_domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')

    await supabase
      .from('generated_sites')
      .update({ custom_domain: cleaned })
      .eq('business_id', id)
      .eq('deploy_status', 'live')
  }

  // Log status change
  await supabase.from('activity_log').insert({
    business_id: id,
    user_id: user.id,
    event_type: 'status_changed',
    event_data: { old_status: business.status, new_status: 'active' },
  })

  // Log tier assignment
  await supabase.from('activity_log').insert({
    business_id: id,
    user_id: user.id,
    event_type: 'tier_changed',
    event_data: { tier, monthly_rate, business_name: business.name },
  })

  // Add note if provided
  if (note) {
    await supabase.from('notes').insert({
      business_id: id,
      user_id: user.id,
      content: note,
    })
  }

  // Create notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'pipeline',
    title: 'Client converted',
    body: `${business.name} converted to ${tier} client at $${monthly_rate}/mo.`,
    business_id: id,
    href: `/clients/${id}`,
  })

  return NextResponse.json(updated)
}
