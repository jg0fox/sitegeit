import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    // Fetch business with related records
    const { data: business, error } = await supabase
      .from('businesses')
      .select('id, name, status, enriched_at, generated_at')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Fetch related pipeline data
    const [siteResult, landingResult, emailResult] = await Promise.all([
      supabase
        .from('generated_sites')
        .select('id, deploy_status, deploy_url, theme_id')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('landing_pages')
        .select('id, deploy_status, deploy_url')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('outreach_emails')
        .select('id, review_status, sequence_position')
        .eq('business_id', businessId)
        .order('sequence_position', { ascending: true }),
    ])

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        status: business.status,
        enriched_at: business.enriched_at,
        generated_at: business.generated_at,
      },
      site: siteResult.data || null,
      landingPage: landingResult.data || null,
      emails: emailResult.data || [],
    })
  } catch (err) {
    console.error('[api/pipeline/status] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
