import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/sites/by-business/[businessId]
 * Returns the latest generated site content for a business.
 */
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

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id, user_id, name')
    .eq('id', businessId)
    .single()

  if (!business || business.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Get latest non-superseded site
  const { data: site, error } = await supabase
    .from('generated_sites')
    .select('id, business_id, homepage_content, service_pages, about_content, contact_content, faq_content, seo_meta, hero_image_url, about_image_url, deploy_url, deploy_status, custom_domain')
    .eq('business_id', businessId)
    .neq('deploy_status', 'superseded')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !site) {
    return NextResponse.json({ error: 'No site found' }, { status: 404 })
  }

  return NextResponse.json({
    ...site,
    business_name: business.name,
  })
}
