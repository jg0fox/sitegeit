import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/sites/[siteId]/content
 * Returns the full editable content for a generated site.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: site, error } = await supabase
    .from('generated_sites')
    .select('id, business_id, homepage_content, service_pages, about_content, contact_content, faq_content, seo_meta, hero_image_url, about_image_url, deploy_url, deploy_status')
    .eq('id', siteId)
    .single()

  if (error || !site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id, user_id, name')
    .eq('id', site.business_id)
    .single()

  if (!business || business.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return NextResponse.json({
    ...site,
    business_name: business.name,
  })
}

/**
 * PUT /api/sites/[siteId]/content
 * Saves updated content for a generated site.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: site } = await supabase
    .from('generated_sites')
    .select('id, business_id')
    .eq('id', siteId)
    .single()

  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', site.business_id)
    .single()

  if (!business || business.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const allowedFields = [
    'homepage_content', 'service_pages', 'about_content',
    'contact_content', 'faq_content', 'seo_meta',
    'hero_image_url', 'about_image_url',
  ]

  const update: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      update[field] = body[field]
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('generated_sites')
    .update(update)
    .eq('id', siteId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('activity_log').insert({
    business_id: site.business_id,
    user_id: user.id,
    event_type: 'site_updated',
    event_data: {
      site_id: siteId,
      action: 'content_edited',
      fields_updated: Object.keys(update),
    },
  })

  return NextResponse.json({ success: true })
}
