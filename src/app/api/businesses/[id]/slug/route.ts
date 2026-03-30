import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
const MAX_SLUG_LENGTH = 48

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const slug = (body.slug as string)?.trim().toLowerCase()

  if (!slug || !SLUG_REGEX.test(slug)) {
    return NextResponse.json(
      { error: 'Slug must be lowercase letters, numbers, and hyphens only' },
      { status: 400 }
    )
  }

  if (slug.length > MAX_SLUG_LENGTH) {
    return NextResponse.json(
      { error: `Slug must be ${MAX_SLUG_LENGTH} characters or fewer` },
      { status: 400 }
    )
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Check slug isn't taken by another business's site
  const { data: existing } = await supabase
    .from('generated_sites')
    .select('business_id')
    .eq('deploy_url', slug)
    .neq('business_id', id)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'This slug is already in use' }, { status: 409 })
  }

  // Update all generated_sites for this business (current + history)
  const { error } = await supabase
    .from('generated_sites')
    .update({ deploy_url: slug })
    .eq('business_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: id,
    user_id: user.id,
    event_type: 'site_updated',
    event_data: { action: 'slug_changed', slug },
  })

  return NextResponse.json({ success: true, slug })
}
